import { Role, Prisma } from '@prisma/client'
import { ForbiddenException } from '@nestjs/common'
import { AuthUser } from '../decorators/current-user.decorator'

/**
 * Returns a Prisma `where` fragment scoping Client queries to what `user` may see.
 * - OWNER / PM_LEAD: all
 * - PM: clients where assignedPmId = user.id
 * - PERFORMER: clients linked through a project the performer is a member of
 * - CLIENT: NOT YET SUPPORTED — throws until invitation flow lands (Phase 4)
 */
export function clientScopeWhere(user: AuthUser): Prisma.ClientWhereInput {
  switch (user.role) {
    case Role.OWNER:
    case Role.PM_LEAD:
      return {}
    case Role.PM:
      return { assignedPmId: user.id }
    case Role.PERFORMER:
      return { projects: { some: { members: { some: { userId: user.id } } } } }
    case Role.CLIENT:
      throw new ForbiddenException('Client-portal access pending provisioning (Phase 4)')
    default:
      throw new ForbiddenException('Role not recognised')
  }
}

export function projectScopeWhere(user: AuthUser): Prisma.ProjectWhereInput {
  switch (user.role) {
    case Role.OWNER:
    case Role.PM_LEAD:
      return {}
    case Role.PM:
      return { OR: [{ pmId: user.id }, { client: { assignedPmId: user.id } }] }
    case Role.PERFORMER:
      return { members: { some: { userId: user.id } } }
    case Role.CLIENT:
      throw new ForbiddenException('Client-portal access pending provisioning (Phase 4)')
    default:
      throw new ForbiddenException('Role not recognised')
  }
}

export function canMutateClient(user: AuthUser): boolean {
  return user.role === Role.OWNER || user.role === Role.PM_LEAD
}

export function canDeleteClient(user: AuthUser): boolean {
  return user.role === Role.OWNER
}
