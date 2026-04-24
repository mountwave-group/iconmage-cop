import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.module'
import { AuditService } from '../audit/audit.service'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { projectScopeWhere } from '../common/scoping/scope'
import {
  CreateProjectDto,
  CreateTaskDto,
  ListProjectsQueryDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/project.dto'

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(actor: AuthUser, query: ListProjectsQueryDto) {
    const where: Prisma.ProjectWhereInput = { AND: [projectScopeWhere(actor)] }
    if (query.status) (where.AND as Prisma.ProjectWhereInput[]).push({ status: query.status })
    if (query.clientId) (where.AND as Prisma.ProjectWhereInput[]).push({ clientId: query.clientId })

    const [total, items] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        take: query.take ?? 25,
        skip: query.skip ?? 0,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { id: true, name: true } } },
      }),
    ])
    return { total, items }
  }

  async findOne(actor: AuthUser, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { AND: [{ id }, projectScopeWhere(actor)] },
      include: {
        client: { select: { id: true, name: true } },
        pm: { select: { id: true, fullName: true, email: true } },
      },
    })
    if (!project) throw new NotFoundException('Project not found')
    return project
  }

  async roadmap(actor: AuthUser, id: string) {
    const project = await this.findOne(actor, id)
    const tasks = await this.prisma.projectTask.findMany({
      where: { projectId: id },
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
    })
    return { project, tasks }
  }

  private assertCanMutateProject(actor: AuthUser, pmId: string | null, clientAssignedPmId: string | null) {
    if (actor.role === Role.OWNER || actor.role === Role.PM_LEAD) return
    if (actor.role === Role.PM && (pmId === actor.id || clientAssignedPmId === actor.id)) return
    throw new ForbiddenException('You may not mutate this project')
  }

  async create(actor: AuthUser, dto: CreateProjectDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
      select: { id: true, assignedPmId: true },
    })
    if (!client) throw new NotFoundException('Client not found')
    this.assertCanMutateProject(actor, dto.pmId ?? null, client.assignedPmId)

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          clientId: dto.clientId,
          serviceCategory: dto.serviceCategory,
          serviceName: dto.serviceName,
          status: dto.status,
          stageCurrent: dto.stageCurrent ?? 1,
          stageTotal: dto.stageTotal ?? 1,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          budgetCents: dto.budgetCents !== undefined ? BigInt(dto.budgetCents) : null,
          currency: dto.currency ?? 'EUR',
          pmId: dto.pmId ?? null,
        },
      })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'project.create',
          entityType: 'Project',
          entityId: created.id,
          diff: { created: serialize(created) },
        },
        tx,
      )
      return created
    })
  }

  async update(actor: AuthUser, id: string, dto: UpdateProjectDto) {
    const existing = await this.findOne(actor, id)
    this.assertCanMutateProject(
      actor,
      existing.pmId,
      (await this.prisma.client.findUnique({
        where: { id: existing.clientId },
        select: { assignedPmId: true },
      }))?.assignedPmId ?? null,
    )

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id },
        data: {
          serviceCategory: dto.serviceCategory,
          serviceName: dto.serviceName,
          status: dto.status,
          stageCurrent: dto.stageCurrent,
          stageTotal: dto.stageTotal,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          budgetCents: dto.budgetCents !== undefined ? BigInt(dto.budgetCents) : undefined,
          currency: dto.currency,
          pmId: dto.pmId,
        },
      })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'project.update',
          entityType: 'Project',
          entityId: id,
          diff: AuditService.diff(serialize(existing), dto as Record<string, unknown>),
        },
        tx,
      )
      return updated
    })
  }

  async remove(actor: AuthUser, id: string) {
    if (actor.role !== Role.OWNER) {
      throw new ForbiddenException('Only OWNER may delete projects')
    }
    const existing = await this.findOne(actor, id)
    return this.prisma.$transaction(async (tx) => {
      await tx.project.delete({ where: { id } })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'project.delete',
          entityType: 'Project',
          entityId: id,
          diff: { deleted: serialize(existing) },
        },
        tx,
      )
      return { id }
    })
  }

  async addTask(actor: AuthUser, projectId: string, dto: CreateTaskDto) {
    const project = await this.findOne(actor, projectId)
    this.assertCanMutateProject(actor, project.pmId, null)
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.projectTask.create({
        data: {
          projectId,
          title: dto.title,
          assigneeRole: dto.assigneeRole,
          status: dto.status,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          kpi: dto.kpi,
        },
      })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'task.create',
          entityType: 'ProjectTask',
          entityId: task.id,
          diff: { created: serialize(task) },
        },
        tx,
      )
      return task
    })
  }

  async updateTask(actor: AuthUser, projectId: string, taskId: string, dto: UpdateTaskDto) {
    const project = await this.findOne(actor, projectId)
    this.assertCanMutateProject(actor, project.pmId, null)

    const existing = await this.prisma.projectTask.findFirst({
      where: { id: taskId, projectId },
    })
    if (!existing) throw new NotFoundException('Task not found')

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.projectTask.update({
        where: { id: taskId },
        data: {
          title: dto.title,
          assigneeRole: dto.assigneeRole,
          status: dto.status,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          kpi: dto.kpi,
        },
      })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'task.update',
          entityType: 'ProjectTask',
          entityId: taskId,
          diff: AuditService.diff(serialize(existing), dto as Record<string, unknown>),
        },
        tx,
      )
      return updated
    })
  }
}

function serialize(value: unknown): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v)),
  )
}
