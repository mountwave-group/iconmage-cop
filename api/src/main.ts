import 'reflect-metadata'
import { NestFactory, Reflector } from '@nestjs/core'
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import compression from 'compression'
import { AppModule } from './app.module'
import { EnvConfig } from './config/env.validation'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const config = app.get<ConfigService<EnvConfig, true>>(ConfigService)
  const logger = new Logger('Bootstrap')

  const isHttps = config.get('NODE_ENV', { infer: true }) === 'production'
  app.use(
    helmet({
      // COOP and OAC are only meaningful over HTTPS; suppress on plain HTTP to
      // avoid browser warnings and agent-cluster inconsistency errors.
      crossOriginOpenerPolicy: isHttps ? { policy: 'same-origin' } : false,
      originAgentCluster: isHttps,
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ICON IMAGE CRM API')
    .setDescription('Private Corporate Operating Platform — internal API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  const port = config.get('PORT', { infer: true })
  await app.listen(port)
  logger.log(`ICON IMAGE API listening on :${port} · docs → /docs`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
