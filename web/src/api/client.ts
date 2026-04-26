// Lightweight auth-aware API client for the ICON IMAGE backend.
// - Persists access/refresh tokens in localStorage.
// - Auto-retries one time on 401 by refreshing the access token.
// - All other errors bubble up as ApiError instances.

const TOKEN_KEY = 'iconimage.tokens.v1'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'OWNER' | 'PM_LEAD' | 'PM' | 'PERFORMER' | 'CLIENT'
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? (JSON.parse(raw) as AuthTokens) : null
  } catch {
    return null
  }
}

function saveTokens(tokens: AuthTokens | null): void {
  if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  else localStorage.removeItem(TOKEN_KEY)
}

let inFlightRefresh: Promise<AuthTokens | null> | null = null

async function refreshAccessToken(): Promise<AuthTokens | null> {
  const current = loadTokens()
  if (!current?.refreshToken) return null
  if (inFlightRefresh) return inFlightRefresh
  inFlightRefresh = (async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      })
      if (!res.ok) {
        saveTokens(null)
        return null
      }
      const next = (await res.json()) as AuthTokens
      saveTokens(next)
      return next
    } catch {
      return null
    } finally {
      inFlightRefresh = null
    }
  })()
  return inFlightRefresh
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Skip Authorization header (e.g. for /auth/login). */
  anonymous?: boolean
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, anonymous, headers, ...rest } = opts
  const send = async (): Promise<Response> => {
    const finalHeaders: Record<string, string> = {
      accept: 'application/json',
      ...(headers as Record<string, string> | undefined),
    }
    if (body !== undefined) finalHeaders['content-type'] = 'application/json'
    if (!anonymous) {
      const tokens = loadTokens()
      if (tokens?.accessToken) finalHeaders.authorization = `Bearer ${tokens.accessToken}`
    }
    return fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let response = await send()

  if (response.status === 401 && !anonymous) {
    const refreshed = await refreshAccessToken()
    if (refreshed) response = await send()
  }

  if (!response.ok) {
    let parsed: unknown
    try {
      parsed = await response.json()
    } catch {
      parsed = await response.text().catch(() => undefined)
    }
    const message =
      (typeof parsed === 'object' && parsed && 'message' in parsed
        ? String((parsed as { message: unknown }).message)
        : null) ?? `Request failed with ${response.status}`
    throw new ApiError(message, response.status, parsed)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

// ── Auth surface ────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const data = await request<{ accessToken: string; refreshToken: string; user: AuthUser }>(
    '/auth/login',
    { method: 'POST', body: { email, password }, anonymous: true },
  )
  const tokens: AuthTokens = { accessToken: data.accessToken, refreshToken: data.refreshToken }
  saveTokens(tokens)
  return { user: data.user, tokens }
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    saveTokens(null)
  }
}

export async function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me')
}

export function getStoredTokens(): AuthTokens | null {
  return loadTokens()
}
