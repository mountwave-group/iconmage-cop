import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { config } from './config'

interface DataStackProps extends StackProps {
  readonly vpc: ec2.IVpc
}

/**
 * DataStack — durable, account-level resources.
 * EFS holds Postgres data, Secrets Manager holds DB + JWT secrets, ECR holds
 * the API container image, S3 holds uploaded files.
 *
 * Removal policy follows `config.retainData` so demo environments tear down
 * cleanly while production environments protect the bytes.
 */
export class DataStack extends Stack {
  public readonly fileSystem: efs.FileSystem
  public readonly postgresAccessPoint: efs.AccessPoint
  public readonly dbSecret: secretsmanager.Secret
  public readonly jwtSecret: secretsmanager.Secret
  public readonly apiRepository: ecr.Repository
  public readonly storageBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props)

    const removalPolicy = config.retainData ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY

    // ─── EFS for Postgres data ──────────────────────────────────────────────
    this.fileSystem = new efs.FileSystem(this, 'PostgresFileSystem', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      encrypted: true,
      enableAutomaticBackups: true,
      removalPolicy,
    })
    // Postgres runs as uid 70 in the alpine image.
    this.postgresAccessPoint = this.fileSystem.addAccessPoint('PostgresAp', {
      path: '/postgres-data',
      createAcl: { ownerUid: '70', ownerGid: '70', permissions: '750' },
      posixUser: { uid: '70', gid: '70' },
    })

    // ─── Secrets ────────────────────────────────────────────────────────────
    this.dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
      secretName: 'iconimage/db',
      description: 'Postgres credentials for ICON IMAGE platform',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'iconimage',
          database: 'iconimage',
          port: 5432,
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
      removalPolicy,
    })

    this.jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: 'iconimage/jwt',
      description: 'JWT signing secrets (access + refresh)',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ accessSecret: '' }),
        generateStringKey: 'refreshSecret',
        excludePunctuation: true,
        passwordLength: 64,
      },
      removalPolicy,
    })
    // CDK's generateSecretString only fills one key; we patch the second key
    // with a separate Custom Resource value at deploy time. Simpler: rotate
    // the value once via the bootstrap script. For the demo, we generate two
    // distinct values via a single secret with two random fields by using a
    // separate secret rotation trigger. To keep this stack simple and
    // deterministic, the operator runs `npm run -w infra bootstrap:jwt` once
    // to populate `accessSecret` post-deploy.

    // ─── ECR ────────────────────────────────────────────────────────────────
    this.apiRepository = new ecr.Repository(this, 'ApiRepository', {
      repositoryName: 'iconimage/api',
      imageScanOnPush: true,
      lifecycleRules: [
        { description: 'Keep last 10 images', maxImageCount: 10 },
        {
          description: 'Expire untagged after 7d',
          tagStatus: ecr.TagStatus.UNTAGGED,
          maxImageAge: Duration.days(7),
        },
      ],
      removalPolicy,
      emptyOnDelete: !config.retainData,
    })

    // ─── S3 storage bucket ──────────────────────────────────────────────────
    this.storageBucket = new s3.Bucket(this, 'StorageBucket', {
      bucketName: `iconimage-storage-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      removalPolicy,
      autoDeleteObjects: !config.retainData,
      cors: [
        {
          allowedOrigins: [config.corsOrigin],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'expire-noncurrent',
          noncurrentVersionExpiration: Duration.days(30),
        },
      ],
    })

    // ─── Outputs ────────────────────────────────────────────────────────────
    new CfnOutput(this, 'EcrRepositoryUri', { value: this.apiRepository.repositoryUri })
    new CfnOutput(this, 'DbSecretArn', { value: this.dbSecret.secretArn })
    new CfnOutput(this, 'JwtSecretArn', { value: this.jwtSecret.secretArn })
    new CfnOutput(this, 'StorageBucketName', { value: this.storageBucket.bucketName })
  }
}
