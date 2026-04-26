import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiError,
  fetchMe,
  getStoredTokens,
  login as apiLogin,
  logout as apiLogout,
  type AuthUser,
} from '../api/client'

interface AuthContextValue {
  user: AuthUser | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')
  const [error, setError] = useState<string | null>(null)

  // On mount: try silent rehydrate using any stored refresh token.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const tokens = getStoredTokens()
      if (!tokens) {
        if (!cancelled) setStatus('unauthenticated')
        return
      }
      try {
        const me = await fetchMe()
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        setUser(null)
        setStatus('unauthenticated')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const { user: nextUser } = await apiLogin(email, password)
      setUser(nextUser)
      setStatus('authenticated')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Sign-in failed.'
      setError(message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({ user, status, error, signIn, signOut }),
    [user, status, error, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
