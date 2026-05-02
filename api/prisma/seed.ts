/* eslint-disable no-console */
import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient, Role, Tier, ServiceCategory, ProjectStatus, TaskStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const rounds = 12
  const [ownerHash, pmLeadHash, pmHash, performerHash] = await Promise.all([
    bcrypt.hash('Owner!Passw0rd', rounds),
    bcrypt.hash('PmLead!Passw0rd', rounds),
    bcrypt.hash('Pm!Passw0rd', rounds),
    bcrypt.hash('Performer!Passw0rd', rounds),
  ])

  const owner = await prisma.user.upsert({
    where: { email: 'varvara@iconimage.group' },
    update: {},
    create: {
      email: 'varvara@iconimage.group',
      passwordHash: ownerHash,
      fullName: 'Varvara Frolova',
      role: Role.OWNER,
    },
  })

  const pmLead = await prisma.user.upsert({
    where: { email: 'aubry@iconimage.group' },
    update: {},
    create: {
      email: 'aubry@iconimage.group',
      passwordHash: pmLeadHash,
      fullName: 'L. Aubry',
      role: Role.PM_LEAD,
    },
  })

  const pm = await prisma.user.upsert({
    where: { email: 'nakamura@iconimage.group' },
    update: {},
    create: {
      email: 'nakamura@iconimage.group',
      passwordHash: pmHash,
      fullName: 'H. Nakamura',
      role: Role.PM,
    },
  })

  const performer = await prisma.user.upsert({
    where: { email: 'devos@iconimage.group' },
    update: {},
    create: {
      email: 'devos@iconimage.group',
      passwordHash: performerHash,
      fullName: 'C. de Vos',
      role: Role.PERFORMER,
    },
  })

  // Idempotent upsert keyed on name to avoid re-introducing non-RFC-4122
  // hardcoded UUIDs (those fail class-validator's IsUUID).
  const existingClient = await prisma.client.findFirst({ where: { name: 'Maison Arielle' } })
  const client = existingClient
    ? await prisma.client.update({ where: { id: existingClient.id }, data: { assignedPmId: pm.id } })
    : await prisma.client.create({
        data: {
          name: 'Maison Arielle',
          country: 'FRANCE',
          tier: Tier.PRIVATE,
          primaryContact: 'Arielle Laurent',
          contactTitle: 'FOUNDER',
          currency: 'EUR',
          notes: 'Founder-led haute perfumerie. Prefers morning calls.',
          assignedPmId: pm.id,
        },
      })

  const existingProject = await prisma.project.findFirst({
    where: { clientId: client.id, serviceName: 'BRANDING · CORPORATE IDENTITY' },
  })
  const project = existingProject
    ? existingProject
    : await prisma.project.create({
        data: {
          clientId: client.id,
          serviceCategory: ServiceCategory.BRANDING,
          serviceName: 'BRANDING · CORPORATE IDENTITY',
          status: ProjectStatus.IN_MOTION,
          stageCurrent: 3,
          stageTotal: 7,
          dueAt: new Date('2026-05-12T00:00:00Z'),
          budgetCents: BigInt(4800000),
          currency: 'EUR',
          pmId: pm.id,
          members: {
            create: [{ userId: performer.id, roleOnProject: Role.PERFORMER }],
          },
          tasks: {
            create: [
              {
                title: 'Brand audit & competitive benchmark',
                assigneeRole: Role.PERFORMER,
                status: TaskStatus.COMPLETE,
                dueAt: new Date('2026-04-02T00:00:00Z'),
                kpi: 'Delivered',
              },
              {
                title: 'Primary wordmark — first round',
                assigneeRole: Role.PERFORMER,
                status: TaskStatus.IN_PROGRESS,
                dueAt: new Date('2026-04-24T00:00:00Z'),
                kpi: '2 concepts',
              },
              {
                title: 'Final delivery & handover',
                assigneeRole: Role.PM,
                status: TaskStatus.PENDING,
                dueAt: new Date('2026-05-12T00:00:00Z'),
                kpi: 'Signed',
              },
            ],
          },
        },
      })

  console.log('Seed complete.')
  console.log({ owner: owner.email, pmLead: pmLead.email, pm: pm.email, performer: performer.email })
  console.log({ client: client.name, project: project.serviceName })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
