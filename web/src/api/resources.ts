// Resource hooks for live API data. Minimal swr-style fetching without an
// extra dependency: load on mount, expose { data, error, loading, refetch }.

import { useCallback, useEffect, useState } from 'react'
import { request, ApiError } from './client'

// ── Resource shapes (mirror Prisma models exposed by the API) ──────────────

export type Role = 'OWNER' | 'PM_LEAD' | 'PM' | 'PERFORMER' | 'CLIENT'

export type ClientStatus = 'LEAD' | 'ACTIVE' | 'DORMANT' | 'ARCHIVED'
export type ClientTier = 'PRIVATE' | 'CORPORATE' | 'VIP'
export type ServiceCategory =
  | 'CONSULTING'
  | 'DIGITAL'
  | 'BRANDING'
  | 'CONTENT'
  | 'PR'
  | 'VIP'
export type ProjectStatus =
  | 'IN_MOTION'
  | 'AWAITING_APPROVAL'
  | 'ON_HOLD'
  | 'DELIVERED'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETE'
export type FileVisibility = 'OWNER' | 'PM' | 'PERFORMER' | 'CLIENT'

export interface ClientResource {
  id: string
  name: string
  country: string
  tier: ClientTier
  status: ClientStatus
  primaryContact: string
  contactTitle: string | null
  currency: string
  notes: string | null
  assignedPmId: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectResource {
  id: string
  clientId: string
  serviceCategory: string
  serviceName: string
  status: string
  stageCurrent: number
  stageTotal: number
  dueAt: string | null
  budgetCents: string | null // BigInt serializes as string
  currency: string
  pmId: string | null
  createdAt: string
  updatedAt: string
}

interface ResourceState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

function useResource<T>(path: string | null): ResourceState<T> & { refetch: () => void } {
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    error: null,
    loading: path !== null,
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (path === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on path becoming null
      setState({ data: null, error: null, loading: false })
      return
    }
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))
    request<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof ApiError ? err.message : 'Request failed.'
        setState({ data: null, error: message, loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [path, tick])

  const refetch = useCallback(() => setTick((n) => n + 1), [])
  return { ...state, refetch }
}

export interface ClientsListResponse {
  total: number
  items: ClientResource[]
}

export function useClients() {
  return useResource<ClientsListResponse>('/clients')
}

export function useClient(id: string | null) {
  return useResource<ClientResource>(id ? `/clients/${id}` : null)
}

export interface ProjectsListResponse {
  total: number
  items: ProjectResource[]
}

export function useProjects() {
  return useResource<ProjectsListResponse>('/projects')
}

export function useProject(id: string | null) {
  return useResource<ProjectResource>(id ? `/projects/${id}` : null)
}

// ── Tasks ─────────────────────────────────────────────────────────────────

export interface TaskResource {
  id: string
  projectId: string
  title: string
  assigneeRole: Role
  status: TaskStatus
  dueAt: string | null
  kpi: number | null
  createdAt: string
  updatedAt: string
}

export interface RoadmapResponse {
  project: ProjectResource
  tasks: TaskResource[]
}

export function useProjectRoadmap(projectId: string | null) {
  return useResource<RoadmapResponse>(projectId ? `/projects/${projectId}/roadmap` : null)
}

// ── Files ─────────────────────────────────────────────────────────────────
// NB: The API exposes presign / download / delete only. There is no list
// endpoint yet, so `useFiles` is intentionally absent. Files surface in the
// UI through their parent client/project records.

export interface FileObjectResource {
  id: string
  filename: string
  contentType: string
  sizeBytes: string // BigInt
  visibility: FileVisibility
  clientId: string | null
  projectId: string | null
  uploadedById: string
  createdAt: string
}

// ── Mutation helpers (imperative) ─────────────────────────────────────────

export interface CreateClientInput {
  name: string
  country: string
  tier: ClientTier
  status?: ClientStatus
  primaryContact: string
  contactTitle?: string
  currency?: string
  notes?: string
  assignedPmId?: string | null
}
export type UpdateClientInput = Partial<CreateClientInput>

export const clientsApi = {
  create: (body: CreateClientInput) =>
    request<ClientResource>('/clients', { method: 'POST', body }),
  update: (id: string, body: UpdateClientInput) =>
    request<ClientResource>(`/clients/${id}`, { method: 'PATCH', body }),
  archive: (id: string) =>
    request<ClientResource>(`/clients/${id}`, { method: 'DELETE' }),
}

export interface CreateProjectInput {
  clientId: string
  serviceCategory: ServiceCategory
  serviceName: string
  status?: ProjectStatus
  stageCurrent?: number
  stageTotal?: number
  dueAt?: string | null
  budgetCents?: number | null
  currency?: string
  pmId?: string | null
}
export type UpdateProjectInput = Partial<CreateProjectInput>

export const projectsApi = {
  create: (body: CreateProjectInput) =>
    request<ProjectResource>('/projects', { method: 'POST', body }),
  update: (id: string, body: UpdateProjectInput) =>
    request<ProjectResource>(`/projects/${id}`, { method: 'PATCH', body }),
  remove: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
}

export interface CreateTaskInput {
  title: string
  assigneeRole: Role
  status?: TaskStatus
  dueAt?: string | null
  kpi?: number | null
}
export type UpdateTaskInput = Partial<CreateTaskInput>

export const tasksApi = {
  create: (projectId: string, body: CreateTaskInput) =>
    request<TaskResource>(`/projects/${projectId}/tasks`, { method: 'POST', body }),
  update: (projectId: string, taskId: string, body: UpdateTaskInput) =>
    request<TaskResource>(`/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body }),
}

export interface PresignUploadInput {
  filename: string
  contentType: string
  sizeBytes: number
  clientId?: string
  projectId?: string
  visibility?: FileVisibility
}
export interface PresignUploadResponse {
  id: string
  uploadUrl: string
  expiresAt: string
}

export const storageApi = {
  presignUpload: (body: PresignUploadInput) =>
    request<PresignUploadResponse>('/storage/presign-upload', { method: 'POST', body }),
  download: (fileId: string) =>
    request<{ downloadUrl: string; expiresAt: string }>(`/storage/${fileId}/download`),
  remove: (fileId: string) =>
    request<FileObjectResource>(`/storage/${fileId}`, { method: 'DELETE' }),
}
