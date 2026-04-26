import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.module'

export interface AuditWriteInput {
  actorUserId: string | null
  action: string
  entityType: string
  entityId: string
  diff?: Prisma.InputJsonValue | Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Writes to the immutable `activity_log` table. Services call `write` *inside*
 * their own Prisma transaction to keep mutation and audit atomic. The
 * `AuditInterceptor` fallback captures route-level actions for endpoints that
 * do not manage their own transaction (fire-and-forget, logged on error).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  write(input: AuditWriteInput, tx?: Prisma.TransactionClient): Promise<unknown> {
    const client = tx ?? this.prisma
    return client.activityLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        diff: (input.diff ?? undefined) as Prisma.InputJsonValue,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    })
  }

  writeSafe(input: AuditWriteInput): void {
    this.write(input).catch((err) => {
      this.logger.error(
        `Audit write failed for ${input.action} ${input.entityType}:${input.entityId}`,
        err,
      )
    })
  }

  static diff<T extends Record<string, unknown>>(
    before: T,
    after: Partial<T>,
  ): Record<string, unknown> {
    const changes: Record<string, { from: unknown; to: unknown }> = {}
    for (const key of Object.keys(after)) {
      const next = (after as Record<string, unknown>)[key]
      const prev = (before as Record<string, unknown>)[key]
      if (next !== undefined && !AuditService.deepEqual(prev, next)) {
        changes[key] = { from: AuditService.safe(prev), to: AuditService.safe(next) }
      }
    }
    return changes
  }

  private static deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
    if (typeof a !== typeof b) return false
    try {
      return JSON.stringify(AuditService.safe(a)) === JSON.stringify(AuditService.safe(b))
    } catch {
      return false
    }
  }

  private static safe(value: unknown): unknown {
    if (typeof value === 'bigint') return value.toString()
    if (value instanceof Date) return value.toISOString()
    return value
  }
}
