# `infra/` — ICON IMAGE CDK platform

AWS CDK (TypeScript) application that provisions every long-lived resource for the ICON IMAGE Corporate Operating Platform.

## Stacks

| Stack | Purpose |
|-------|---------|
| `NetworkStack` | Imports the shared `mw-vpc` (vpc-08bf14adedd4a07ef), creates VPC interface endpoints (Secrets Manager, ECR, Logs) + S3 gateway endpoint, and the three SGs (api / db / migration). No new subnets — workloads run in the existing public subnets, isolated by SG ingress rules. |
| `DataStack` | EFS (Postgres data), ECR (API image), Secrets Manager (DB + JWT), S3 (uploads) |
| `PostgresStack` | ECS cluster + single Fargate task running `postgres:16-alpine` on EFS, registered in Cloud Map (`postgres.iconimage.local`) |
| `MigrationStack` | One-shot Fargate task that runs `prisma migrate deploy && seed` |
| `ApiStack` | NestJS Lambda + API Gateway HTTP v2 + custom domain `api.mountwavegroup.com` |

Stack dependencies are explicit in `bin/iconimage.ts` — you can deploy them one by one or with `cdk deploy --all`.

## Prerequisites

- Node 20
- AWS CLI v2 with profile `amplify-uk` (account `585008043730`, region `eu-west-2`)
- A Route 53 public hosted zone for `mountwavegroup.com` (ACM cert is DNS-validated against it)
- Docker (only needed locally to build the API image; CI handles CD)

## First-time setup

```bash
cd infra
npm install
export CDK_DEFAULT_ACCOUNT=585008043730
export CDK_DEFAULT_REGION=eu-west-2

# Bootstrap CDK in the target account/region (one-time, idempotent).
npx cdk bootstrap aws://585008043730/eu-west-2 --profile amplify-uk

# Synthesize.
npm run synth
```

## Deploy order (manual, first time)

```bash
# 1. Foundation
npm run deploy:network
npm run deploy:data

# 2. Push the first API image to ECR (so PostgresStack & migration task can run).
cd ../api
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 585008043730.dkr.ecr.eu-west-2.amazonaws.com
docker build -t 585008043730.dkr.ecr.eu-west-2.amazonaws.com/iconimage/api:latest .
docker push 585008043730.dkr.ecr.eu-west-2.amazonaws.com/iconimage/api:latest
cd ../infra

# 3. Postgres + Migrations + API
npm run deploy:postgres
npm run deploy -- MigrationStack
npm run deploy:api

# 4. Run migrations.
aws ecs run-task --cluster iconimage --launch-type FARGATE \
  --task-definition iconimage-migration \
  --network-configuration "awsvpcConfiguration={subnets=[<priv-egress-subnets>],securityGroups=[<migration-sg>],assignPublicIp=DISABLED}"
```

Outputs from `MigrationStack` give you the exact subnet/SG ids — see CloudFormation outputs.

## Subsequent deploys

CI handles this — push to `main` triggers `.github/workflows/deploy-api.yml`.

## Tear-down (demo only)

```bash
npx cdk destroy --all
```

`config.retainData = false` ensures EFS, ECR, S3, and Secrets are removed cleanly. Flip to `true` for production.
