import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import { config } from './config'

interface ApiStackProps extends StackProps {
  readonly vpc: ec2.IVpc
  readonly apiSecurityGroup: ec2.ISecurityGroup
  readonly dbSecret: secretsmanager.ISecret
  readonly jwtSecret: secretsmanager.ISecret
  readonly s3Bucket: s3.IBucket
  readonly postgresHost: string
  readonly apiRepository: ecr.IRepository
}

/**
 * ApiStack — NestJS as a Lambda DockerImageFunction fronted by API Gateway v2
 * with a regional custom domain on `api.<root>`.
 *
 * Using DockerImageFunction (container image) instead of NodejsFunction (zip)
 * because the Prisma query engine binaries exceed Lambda's 250 MB unzipped
 * zip limit. Container images have a 10 GB limit and re-use the same ECR
 * image that ECS uses for migrations.
 */
export class ApiStack extends Stack {
  public readonly httpApi: apigwv2.HttpApi
  public readonly handler: lambda.DockerImageFunction

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    this.handler = new lambda.DockerImageFunction(this, 'ApiHandler', {
      functionName: 'iconimage-api',
      // Pull the `latest` tag from ECR on every deploy.
      code: lambda.DockerImageCode.fromEcr(props.apiRepository, {
        tagOrDigest: 'latest',
      }),
      architecture: lambda.Architecture.X86_64,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      reservedConcurrentExecutions: 10,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      allowPublicSubnet: true,
      securityGroups: [props.apiSecurityGroup],
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        NODE_ENV: 'production',
        PORT: '4000',
        DB_SECRET_ARN: props.dbSecret.secretArn,
        JWT_SECRET_ARN: props.jwtSecret.secretArn,
        POSTGRES_HOST: props.postgresHost,
        JWT_ACCESS_TTL: '15m',
        JWT_REFRESH_TTL: '7d',
        BCRYPT_ROUNDS: '12',
        CORS_ORIGIN: config.corsOrigin,
        S3_REGION: this.region,
        S3_BUCKET: props.s3Bucket.bucketName,
        PRISMA_HIDE_UPDATE_MESSAGE: 'true',
      },
    })

    props.apiRepository.grantPull(this.handler)
    props.s3Bucket.grantReadWrite(this.handler)
    props.dbSecret.grantRead(this.handler)
    props.jwtSecret.grantRead(this.handler)

    // ─── Custom domain ──────────────────────────────────────────────────────
    const rootDomain = config.apiDomainName.split('.').slice(-2).join('.')
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: rootDomain,
    })
    const certificate = new acm.Certificate(this, 'ApiCertificate', {
      domainName: config.apiDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    })

    const customDomain = new apigwv2.DomainName(this, 'ApiDomain', {
      domainName: config.apiDomainName,
      certificate,
      endpointType: apigwv2.EndpointType.REGIONAL,
      securityPolicy: apigwv2.SecurityPolicy.TLS_1_2,
    })

    // ─── HTTP API ───────────────────────────────────────────────────────────
    this.httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'iconimage-api',
      defaultDomainMapping: { domainName: customDomain },
      corsPreflight: {
        allowOrigins: [config.corsOrigin],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PATCH,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['authorization', 'content-type', 'accept'],
        allowCredentials: true,
        maxAge: Duration.minutes(10),
      },
    })

    this.httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        apigwv2.HttpMethod.GET,
        apigwv2.HttpMethod.POST,
        apigwv2.HttpMethod.PATCH,
        apigwv2.HttpMethod.PUT,
        apigwv2.HttpMethod.DELETE,
        apigwv2.HttpMethod.OPTIONS,
      ],
      integration: new integrations.HttpLambdaIntegration('LambdaProxy', this.handler),
    })

    // Root path proxy (NestJS routes like `/auth/login` need `/` to map too).
    this.httpApi.addRoutes({
      path: '/',
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('LambdaProxyRoot', this.handler),
    })

    // ─── DNS ────────────────────────────────────────────────────────────────
    new route53.ARecord(this, 'ApiAlias', {
      zone: hostedZone,
      recordName: config.apiDomainName.replace(`.${rootDomain}`, ''),
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          customDomain.regionalDomainName,
          customDomain.regionalHostedZoneId,
        ),
      ),
    })

    new CfnOutput(this, 'ApiUrl', { value: `https://${config.apiDomainName}` })
    new CfnOutput(this, 'ExecuteApiUrl', { value: this.httpApi.apiEndpoint })
  }
}
