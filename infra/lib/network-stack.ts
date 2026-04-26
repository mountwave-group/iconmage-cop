import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'

interface NetworkStackProps extends StackProps {
  /** Existing VPC ID to import (already provisioned outside this app). */
  readonly vpcId: string
}

/**
 * NetworkStack — thin wrapper around an existing VPC.
 *
 * The ICON IMAGE platform reuses the shared `mw-vpc` (vpc-08bf14adedd4a07ef)
 * provisioned by the parent NetworkStack-eu-west-2 stack. That VPC currently
 * exposes two public subnets and an Internet Gateway. We do NOT create new
 * subnets here; we only create the security groups that mediate east-west
 * traffic between Lambda, the Postgres Fargate task, and the migration task,
 * plus VPC interface endpoints so workloads can reach Secrets Manager / ECR /
 * CloudWatch Logs without traversing the public internet.
 *
 * Security model:
 *   - Postgres SG: ingress :5432 only from API SG and Migration SG.
 *   - API SG / Migration SG: egress only.
 *   - Public-subnet placement is acceptable because the SGs (not subnet
 *     boundary) are the security perimeter; nothing exposes Postgres to the
 *     internet, and Lambda gets internet only via VPC endpoints.
 */
export class NetworkStack extends Stack {
  public readonly vpc: ec2.IVpc
  public readonly apiSecurityGroup: ec2.SecurityGroup
  public readonly dbSecurityGroup: ec2.SecurityGroup
  public readonly migrationSecurityGroup: ec2.SecurityGroup

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props)

    this.vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', { vpcId: props.vpcId })

    new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      privateDnsEnabled: true,
    })
    new ec2.InterfaceVpcEndpoint(this, 'EcrApiEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      privateDnsEnabled: true,
    })
    new ec2.InterfaceVpcEndpoint(this, 'EcrDkrEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      privateDnsEnabled: true,
    })
    new ec2.InterfaceVpcEndpoint(this, 'CloudWatchLogsEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      privateDnsEnabled: true,
    })
    new ec2.GatewayVpcEndpoint(this, 'S3Endpoint', {
      vpc: this.vpc,
      service: ec2.GatewayVpcEndpointAwsService.S3,
    })

    this.apiSecurityGroup = new ec2.SecurityGroup(this, 'ApiSg', {
      vpc: this.vpc,
      description: 'iconimage-api Lambda - egress only',
      allowAllOutbound: true,
    })

    this.migrationSecurityGroup = new ec2.SecurityGroup(this, 'MigrationSg', {
      vpc: this.vpc,
      description: 'iconimage migration Fargate task - egress only',
      allowAllOutbound: true,
    })

    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSg', {
      vpc: this.vpc,
      description: 'iconimage postgres Fargate task',
      allowAllOutbound: true,
    })
    this.dbSecurityGroup.addIngressRule(
      this.apiSecurityGroup,
      ec2.Port.tcp(5432),
      'API Lambda to Postgres',
    )
    this.dbSecurityGroup.addIngressRule(
      this.migrationSecurityGroup,
      ec2.Port.tcp(5432),
      'Migration task to Postgres',
    )

    new CfnOutput(this, 'VpcId', { value: this.vpc.vpcId })
  }
}
