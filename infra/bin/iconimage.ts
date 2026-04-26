#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { config, tags } from '../lib/config'
import { NetworkStack } from '../lib/network-stack'
import { DataStack } from '../lib/data-stack'
import { PostgresStack } from '../lib/postgres-stack'
import { ApiStack } from '../lib/api-stack'
import { MigrationStack } from '../lib/migration-stack'

const app = new cdk.App()
const env: cdk.Environment = { account: config.account, region: config.region }

const network = new NetworkStack(app, 'NetworkStack', { env, vpcId: config.vpcId })
const data = new DataStack(app, 'DataStack', { env, vpc: network.vpc })

const postgres = new PostgresStack(app, 'PostgresStack', {
  env,
  vpc: network.vpc,
  dbSecurityGroup: network.dbSecurityGroup,
  dbSecret: data.dbSecret,
  fileSystem: data.fileSystem,
  accessPoint: data.postgresAccessPoint,
})

const migration = new MigrationStack(app, 'MigrationStack', {
  env,
  vpc: network.vpc,
  migrationSecurityGroup: network.migrationSecurityGroup,
  cluster: postgres.cluster,
  apiRepository: data.apiRepository,
  dbSecret: data.dbSecret,
  postgresHost: postgres.postgresHost,
})
migration.addDependency(postgres)

const api = new ApiStack(app, 'ApiStack', {
  env,
  vpc: network.vpc,
  apiSecurityGroup: network.apiSecurityGroup,
  dbSecret: data.dbSecret,
  jwtSecret: data.jwtSecret,
  s3Bucket: data.storageBucket,
  postgresHost: postgres.postgresHost,
  apiRepository: data.apiRepository,
})
api.addDependency(postgres)

// Apply common tags to every stack.
for (const [k, v] of Object.entries(tags)) {
  cdk.Tags.of(app).add(k, v)
}
