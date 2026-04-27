/* eslint-disable react-refresh/only-export-components -- co-located hook for ergonomics */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ToastTone = 'success' | 'error'
interface Toast {
  id: number
  tone: ToastTone
  title: string
  body?: string
}

interface ToastApi {
  push: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, body?: string) => void
  error: (title: string, body?: string) => void
}

const Ctx = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setItems((s) => s.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setItems((s) => [...s, { ...t, id }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const api = useMemo<ToastApi>(() => ({
    push,
    success: (title, body) => push({ tone: 'success', title, body }),
    error: (title, body) => push({ tone: 'error', title, body }),
  }), [push])

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-[min(360px,calc(100vw-32px))]" role="region" aria-live="polite">
        {items.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  )
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`toast ${toast.tone === 'error' ? 'toast-error' : ''} px-5 py-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow text-[10px]">{toast.tone === 'error' ? 'Error' : 'Confirmed'}</div>
          <div className="mt-1 text-[14px] text-ink-primary">{toast.title}</div>
          {toast.body && <div className="mt-1 text-[12px] text-ink-muted">{toast.body}</div>}
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="text-ink-muted hover:text-ink-primary -mr-1 -mt-1 p-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
