import 'reflect-metadata'
import { NestFactory, Reflector } from '@nestjs/core'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import helmet from 'helmet'
import compression from 'compression'
import express from 'express'
import serverlessExpress from '@codegenie/serverless-express'
import type { Handler } from 'aws-lambda'
import type { EnvConfig } from './config/env.validation'

/**
 * Lambda entrypoint for the ICON IMAGE API.
 *
 * Cold-start sequence:
 *   1. Hydrate DB + JWT secrets from Secrets Manager into process.env.
 *      We do this _before_ importing AppModule so Nest's Zod-validated
 *      ConfigService sees fully-populated environment variables.
 *   2. Boot Nest with an Express adapter.
 *   3. Wrap the Express app with `@codegenie/serverless-express` and cache.
 *
 * Warm invocations skip steps 1–3 entirely.
 */

let cachedHandler: Handler | undefined

interface DbSecret {
  username: string
  password: string
  host?: string
  port?: number
  database: string
}
interface JwtSecret {
  accessSecret: string
  refreshSecret: string
}

async function hydrateSecrets(): Promise<void> {
  if (process.env.DATABASE_URL && process.env.JWT_ACCESS_SECRET) return // local dev shortcut

  const region = process.env.AWS_REGION ?? 'eu-west-2'
  const client = new SecretsManagerClient({ region })

  const [dbResp, jwtResp] = await Promise.all([
    client.send(new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN! })),
    client.send(new GetSecretValueCommand({ SecretId: process.env.JWT_SECRET_ARN! })),
  ])

  const db = JSON.parse(dbResp.SecretString ?? '{}') as DbSecret
  const jwt = JSON.parse(jwtResp.SecretString ?? '{}') as JwtSecret
  const host = process.env.POSTGRES_HOST ?? db.host
  const port = db.port ?? 5432

  // Cap connection_limit to keep total open Postgres connections bounded by
  // (reserved concurrency × connection_limit). 10 × 3 = 30 connections max.
  process.env.DATABASE_URL = `postgresql://${db.username}:${encodeURIComponent(db.password)}@${host}:${port}/${db.database}?schema=public&connection_limit=3`
  process.env.JWT_ACCESS_SECRET = jwt.accessSecret
  process.env.JWT_REFRESH_SECRET = jwt.refreshSecret
}

async function bootstrap(): Promise<Handler> {
  await hydrateSecrets()
  // Late import — AppModule pulls Zod env validation at module load time, so
  // it must run after secrets are present in process.env.
  const { AppModule } = await import('./app.module')

  const expressApp = express()
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    bufferLogs: true,
  })
  const config = app.get<ConfigService<EnvConfig, true>>(ConfigService)

  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      originAgentCluster: true,
      contentSecurityPolicy: false,
    }),
  )
  app.use(compression())
  app.enableCors({
    origin: config
      .get('CORS_ORIGIN', { infer: true })
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  await app.init()
  return serverlessExpress({ app: expressApp })
}

export const handler: Handler = async (event, context, callback) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap()
  }
  return cachedHandler(event, context, callback)
}
