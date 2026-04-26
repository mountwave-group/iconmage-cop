/**
 * Shared deployment configuration for the ICON IMAGE platform.
 * Single source of truth for region, account, naming, and demo defaults.
 */
export interface IconImageConfig {
  /** AWS region for all stacks (regional API GW + ACM live here too). */
  readonly region: string
  /** AWS account id; resolved from env when omitted. */
  readonly account?: string
  /** Logical environment name — feeds into resource tags and Cloud Map ns. */
  readonly envName: 'demo' | 'staging' | 'production'
  /** Public hostname for the API. ACM cert must validate this name. */
  readonly apiDomainName: string
  /** Origin allowed by the API CORS policy (the dashboard URL). */
  readonly corsOrigin: string
  /** Cloud Map private namespace — internal DNS for service discovery. */
  readonly serviceNamespace: string
  /** Removal policy hint — DESTROY for demo, RETAIN for production data. */
  readonly retainData: boolean
  /** Existing VPC ID — we reuse the shared mw-vpc rather than creating one. */
  readonly vpcId: string
}

export const config: IconImageConfig = {
  region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-2',
  account: process.env.CDK_DEFAULT_ACCOUNT,
  envName: 'demo',
  apiDomainName: 'api.mountwavegroup.com',
  corsOrigin: 'https://icop.mountwavegroup.com',
  serviceNamespace: 'iconimage.local',
  retainData: false,
  vpcId: 'vpc-08bf14adedd4a07ef',
}

export const tags = {
  Project: 'iconimage',
  Owner: 'platform',
  Environment: config.envName,
  ManagedBy: 'cdk',
}
