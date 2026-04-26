import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ClientStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.module'
import { AuditService } from '../audit/audit.service'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { canDeleteClient, canMutateClient, clientScopeWhere } from '../common/scoping/scope'
import { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from './dto/client.dto'

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(actor: AuthUser, query: ListClientsQueryDto) {
    const where: Prisma.ClientWhereInput = {
      AND: [clientScopeWhere(actor)],
    }
    if (query.status) (where.AND as Prisma.ClientWhereInput[]).push({ status: query.status })
    if (query.tier) (where.AND as Prisma.ClientWhereInput[]).push({ tier: query.tier })

    const [total, items] = await this.prisma.$transaction([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        take: query.take ?? 25,
        skip: query.skip ?? 0,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    return { total, items }
  }

  async findOne(actor: AuthUser, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { AND: [{ id }, clientScopeWhere(actor)] },
    })
    if (!client) throw new NotFoundException('Client not found')
    return client
  }

  async create(actor: AuthUser, dto: CreateClientDto) {
    if (!canMutateClient(actor)) {
      throw new ForbiddenException('Only OWNER or PM_LEAD may create clients')
    }
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.client.create({ data: dto })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'client.create',
          entityType: 'Client',
          entityId: created.id,
          diff: { created: AuditService.diff({}, created as unknown as Record<string, unknown>) },
        },
        tx,
      )
      return created
    })
  }

  async update(actor: AuthUser, id: string, dto: UpdateClientDto) {
    if (!canMutateClient(actor)) {
      throw new ForbiddenException('Only OWNER or PM_LEAD may modify clients')
    }
    const existing = await this.findOne(actor, id)
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.client.update({ where: { id }, data: dto })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'client.update',
          entityType: 'Client',
          entityId: id,
          diff: AuditService.diff(
            existing as unknown as Record<string, unknown>,
            dto as unknown as Record<string, unknown>,
          ),
        },
        tx,
      )
      return updated
    })
  }

  async archive(actor: AuthUser, id: string) {
    if (!canDeleteClient(actor)) {
      throw new ForbiddenException('Only OWNER may archive clients')
    }
    const existing = await this.findOne(actor, id)
    if (existing.status === ClientStatus.ARCHIVED) return existing

    return this.prisma.$transaction(async (tx) => {
      const archived = await tx.client.update({
        where: { id },
        data: { status: ClientStatus.ARCHIVED },
      })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'client.archive',
          entityType: 'Client',
          entityId: id,
          diff: { status: { from: existing.status, to: ClientStatus.ARCHIVED } },
        },
        tx,
      )
      return archived
    })
  }
}
