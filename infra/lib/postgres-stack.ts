import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { config } from './config'

interface PostgresStackProps extends StackProps {
  readonly vpc: ec2.IVpc
  readonly dbSecurityGroup: ec2.ISecurityGroup
  readonly dbSecret: secretsmanager.ISecret
  readonly fileSystem: efs.IFileSystem
  readonly accessPoint: efs.IAccessPoint
}

/**
 * PostgresStack — single-task Fargate service running postgres:16-alpine
 * with EFS-backed persistence and Cloud Map service discovery.
 *
 * Hard constraint: minHealthyPercent: 0 / maxHealthyPercent: 100.
 * This guarantees the orchestrator never starts a second task before stopping
 * the first. Two tasks touching the same EFS Postgres data dir = corruption.
 */
export class PostgresStack extends Stack {
  public readonly cluster: ecs.Cluster
  public readonly service: ecs.FargateService
  /** Internal DNS name resolvable from any sg attached to the VPC. */
  public readonly postgresHost: string

  constructor(scope: Construct, id: string, props: PostgresStackProps) {
    super(scope, id, props)

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'iconimage',
      vpc: props.vpc,
      containerInsights: true,
      defaultCloudMapNamespace: {
        name: config.serviceNamespace,
        type: servicediscovery.NamespaceType.DNS_PRIVATE,
        useForServiceConnect: false,
        vpc: props.vpc,
      },
    })

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      family: 'iconimage-postgres',
      cpu: 512,
      memoryLimitMiB: 1024,
      volumes: [
        {
          name: 'pgdata',
          efsVolumeConfiguration: {
            fileSystemId: props.fileSystem.fileSystemId,
            transitEncryption: 'ENABLED',
            authorizationConfig: {
              accessPointId: props.accessPoint.accessPointId,
              iam: 'ENABLED',
            },
          },
        },
      ],
    })
    props.fileSystem.grantRootAccess(taskDefinition.taskRole)
    props.fileSystem.connections.allowDefaultPortFrom(props.dbSecurityGroup)

    const logGroup = new logs.LogGroup(this, 'PostgresLogs', {
      logGroupName: '/iconimage/postgres',
      retention: logs.RetentionDays.ONE_MONTH,
    })

    const container = taskDefinition.addContainer('postgres', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/docker/library/postgres:16-alpine'),
      containerName: 'postgres',
      essential: true,
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'pg' }),
      environment: {
        // Place the data subdirectory _below_ the EFS mount so postgres can
        // chown/chmod freely without fighting EFS root permissions.
        PGDATA: '/var/lib/postgresql/data/pgdata',
      },
      secrets: {
        POSTGRES_USER: ecs.Secret.fromSecretsManager(props.dbSecret, 'username'),
        POSTGRES_PASSWORD: ecs.Secret.fromSecretsManager(props.dbSecret, 'password'),
        POSTGRES_DB: ecs.Secret.fromSecretsManager(props.dbSecret, 'database'),
      },
      portMappings: [{ containerPort: 5432, protocol: ecs.Protocol.TCP }],
      healthCheck: {
        command: ['CMD-SHELL', 'pg_isready -U $POSTGRES_USER -d $POSTGRES_DB'],
        interval: Duration.seconds(15),
        timeout: Duration.seconds(5),
        retries: 5,
        startPeriod: Duration.seconds(60),
      },
    })
    container.addMountPoints({
      sourceVolume: 'pgdata',
      containerPath: '/var/lib/postgresql/data',
      readOnly: false,
    })

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      taskDefinition,
      serviceName: 'postgres',
      desiredCount: 1,
      // Critical for stateful single-task: never overlap two tasks on EFS.
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      assignPublicIp: true,
      securityGroups: [props.dbSecurityGroup],
      cloudMapOptions: {
        name: 'postgres',
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: Duration.seconds(15),
      },
      enableExecuteCommand: true,
      circuitBreaker: { rollback: true },
    })

    this.postgresHost = `postgres.${config.serviceNamespace}`

    new CfnOutput(this, 'PostgresHost', { value: this.postgresHost })
    new CfnOutput(this, 'ClusterName', { value: this.cluster.clusterName })
  }
}
