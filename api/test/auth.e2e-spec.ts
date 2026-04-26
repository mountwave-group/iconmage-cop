import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.module'

/**
 * This file is a smoke/e2e sketch — runs against the seeded database.
 * Requires: docker compose up -d postgres && npm run prisma:migrate && npm run seed
 */
describe('Auth (e2e)', () => {
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

  it('rejects login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'varvara@iconimage.group', password: 'wrong-password-xyz' })
      .expect(401)
  })

  it('issues tokens for the seeded owner', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'varvara@iconimage.group', password: 'Owner!Passw0rd' })
      .expect(200)

    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.refreshToken).toEqual(expect.any(String))
    expect(res.body.user.role).toBe('OWNER')
  })

  it('returns the current user via /auth/me', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'varvara@iconimage.group', password: 'Owner!Passw0rd' })

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body.email).toBe('varvara@iconimage.group')
      })
  })
})
