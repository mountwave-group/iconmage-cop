// Role-matrix mirror of the NestJS @Roles guards. Source of truth for which
// action buttons should render in the UI. Backend still enforces 403.
import type { AuthUser } from '../api/client'

export type Role = AuthUser['role']

export type Action =
  | 'client.read'
  | 'client.create'
  | 'client.update'
  | 'client.archive'
  | 'client.notes.read'
  | 'project.read'
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'project.budget.read'
  | 'task.read'
  | 'task.create'
  | 'task.update'
  | 'storage.upload'
  | 'storage.download'
  | 'storage.delete'

const MATRIX: Record<Action, Role[]> = {
  'client.read': ['OWNER', 'PM_LEAD', 'PM', 'PERFORMER'],
  'client.create': ['OWNER', 'PM_LEAD'],
  'client.update': ['OWNER', 'PM_LEAD'],
  'client.archive': ['OWNER'],
  'client.notes.read': ['OWNER', 'PM_LEAD'],
  'project.read': ['OWNER', 'PM_LEAD', 'PM', 'PERFORMER'],
  'project.create': ['OWNER', 'PM_LEAD', 'PM'],
  'project.update': ['OWNER', 'PM_LEAD', 'PM'],
  'project.delete': ['OWNER'],
  'project.budget.read': ['OWNER', 'PM_LEAD'],
  'task.read': ['OWNER', 'PM_LEAD', 'PM', 'PERFORMER'],
  'task.create': ['OWNER', 'PM_LEAD', 'PM'],
  'task.update': ['OWNER', 'PM_LEAD', 'PM'],
  'storage.upload': ['OWNER', 'PM_LEAD', 'PM', 'PERFORMER'],
  'storage.download': ['OWNER', 'PM_LEAD', 'PM', 'PERFORMER', 'CLIENT'],
  'storage.delete': ['OWNER', 'PM_LEAD', 'PM', 'PERFORMER'],
}

export function can(user: AuthUser | null | undefined, action: Action): boolean {
  if (!user) return false
  return MATRIX[action].includes(user.role)
}
