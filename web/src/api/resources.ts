// Resource hooks for live API data. Minimal swr-style fetching without an
// extra dependency: load on mount, expose { data, error, loading, refetch }.

import { useCallback, useEffect, useState } from 'react'
import { request, ApiError } from './client'

// ── Resource shapes (mirror Prisma models exposed by the API) ──────────────

export type Role = 'OWNER' | 'PM_LEAD' | 'PM' | 'PERFORMER' | 'CLIENT'

export type ClientStatus = 'ACTIVE' | 'PROSPECT' | 'ARCHIVED'
export type ClientTier = 'PRIVATE' | 'CORPORATE' | 'VIP'

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
