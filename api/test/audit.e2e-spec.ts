import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.module'

describe('Audit log immutability', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()
    prisma = app.get(PrismaService)
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  it('ensures activity_log rows cannot be updated or deleted', async () => {
    const entry = await prisma.activityLog.findFirst({ orderBy: { timestamp: 'desc' } })
    if (!entry) return // nothing to test yet
    await expect(
      prisma.activityLog.update({ where: { id: entry.id }, data: { action: 'tampered' } }),
    ).rejects.toThrow()
    await expect(
      prisma.activityLog.delete({ where: { id: entry.id } }),
    ).rejects.toThrow()
  })

  it('smoke test app is reachable', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({})
    // 400 = validation error means the app is up and routing correctly
    expect([200, 201, 400, 401]).toContain(res.status)
  })
})
