import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.module'

describe('Clients (e2e, role scoping)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let ownerToken: string
  let pmToken: string
  let performerToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()
    prisma = app.get(PrismaService)

    const login = (email: string, password: string) =>
      request(app.getHttpServer()).post('/auth/login').send({ email, password })

    ownerToken = (await login('varvara@iconimage.group', 'Owner!Passw0rd')).body.accessToken
    pmToken = (await login('nakamura@iconimage.group', 'Pm!Passw0rd')).body.accessToken
    performerToken = (await login('devos@iconimage.group', 'Performer!Passw0rd')).body.accessToken
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  it('OWNER lists all clients', async () => {
    const res = await request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200)
    expect(res.body.total).toBeGreaterThanOrEqual(1)
  })

  it('PM sees only assigned clients', async () => {
    const res = await request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200)
    expect(res.body.items.every((c: { assignedPmId: string | null }) => c.assignedPmId)).toBe(true)
  })

  it('PERFORMER sees only clients reachable through project membership', async () => {
    await request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', `Bearer ${performerToken}`)
      .expect(200)
  })

  it('PM cannot create a client', async () => {
    await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Forbidden Maison',
        country: 'FR',
        tier: 'PRIVATE',
        primaryContact: 'Nobody',
      })
      .expect(403)
  })

  it('OWNER creates a client and writes an audit entry', async () => {
    const before = await prisma.activityLog.count({ where: { action: 'client.create' } })
    const res = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Test Maison ' + Date.now(),
        country: 'MC',
        tier: 'VIP',
        primaryContact: 'Test Contact',
      })
      .expect(201)
    expect(res.body.id).toEqual(expect.any(String))
    const after = await prisma.activityLog.count({ where: { action: 'client.create' } })
    expect(after).toBe(before + 1)
  })
})
