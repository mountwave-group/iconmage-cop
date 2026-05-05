import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'

interface MigrationStackProps extends StackProps {
  readonly vpc: ec2.IVpc
  readonly migrationSecurityGroup: ec2.ISecurityGroup
  readonly cluster: ecs.ICluster
  readonly apiRepository: ecr.IRepository
  readonly dbSecret: secretsmanager.ISecret
  readonly postgresHost: string
}

/**
 * MigrationStack — defines a one-shot Fargate task that runs Prisma migrations
 * and seeds against the live Postgres service. CI invokes it via
 * `aws ecs run-task` after pushing a new image tag. The task definition is
 * permanent; only invocations are transient.
 */
export class MigrationStack extends Stack {
  public readonly taskDefinition: ecs.FargateTaskDefinition
  public readonly subnetIds: string[]
  public readonly securityGroupId: string

  constructor(scope: Construct, id: string, props: MigrationStackProps) {
    super(scope, id, props)

    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'MigrationTaskDef', {
      family: 'iconimage-migration',
      cpu: 512,
      memoryLimitMiB: 1024,
    })
    props.dbSecret.grantRead(this.taskDefinition.taskRole)

    this.taskDefinition.addContainer('migrate', {
      image: ecs.ContainerImage.fromEcrRepository(props.apiRepository, 'latest'),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        logGroup: new logs.LogGroup(this, 'MigrationLogs', {
          logGroupName: '/iconimage/migration',
          retention: logs.RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'migrate',
      }),
      environment: {
        POSTGRES_HOST: props.postgresHost,
      },
      secrets: {
        POSTGRES_USER: ecs.Secret.fromSecretsManager(props.dbSecret, 'username'),
        POSTGRES_PASSWORD: ecs.Secret.fromSecretsManager(props.dbSecret, 'password'),
        POSTGRES_DB: ecs.Secret.fromSecretsManager(props.dbSecret, 'database'),
      },
      // Override Docker ENTRYPOINT (Lambda RIC in base image) with plain sh
      // so the migration script runs directly in ECS rather than via Lambda RIC.
      entryPoint: ['/bin/sh'],
      command: [
        '-c',
        [
          'export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?schema=public"',
          // Self-heal: clear any prior failed-state record for the buggy
          // 20260502201500_fix_seed_uuids migration. No-op if not failed.
          'npx prisma migrate resolve --rolled-back 20260502201500_fix_seed_uuids 2>/dev/null || true',
          'npx prisma migrate deploy',
          'node dist/prisma/seed.js',
        ].join(' && '),
      ],
    })

    this.subnetIds = props.vpc
      .selectSubnets({ subnetType: ec2.SubnetType.PUBLIC })
      .subnetIds
    this.securityGroupId = props.migrationSecurityGroup.securityGroupId

    new CfnOutput(this, 'MigrationTaskDefinitionArn', {
      value: this.taskDefinition.taskDefinitionArn,
    })
    new CfnOutput(this, 'MigrationSubnetIds', { value: this.subnetIds.join(',') })
    new CfnOutput(this, 'MigrationSecurityGroupId', { value: this.securityGroupId })
    new CfnOutput(this, 'MigrationClusterName', { value: props.cluster.clusterName })
  }
}
