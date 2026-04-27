import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: number
}

/**
 * Centered modal · 560px default · §1.3 Modal spec.
 * Mobile (<640px): full-screen sheet with drag handle.
 */
export function Modal({ open, onClose, title, eyebrow, children, footer, maxWidth = 560 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="modal-backdrop flex items-end sm:items-center justify-center px-0 sm:px-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-panel w-full sm:w-full sm:max-h-[88vh] max-h-[92dvh] overflow-y-auto rounded-t-luxe sm:rounded-luxe"
        style={{ maxWidth }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>
        <div className="px-6 sm:px-12 pt-6 sm:pt-10 pb-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h2 className="mt-2 font-serif text-[24px] sm:text-[28px] tracking-[-0.01em] text-ink-primary leading-tight">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="touch-target -mr-2 -mt-2 inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="px-6 sm:px-12 pt-6 pb-8">{children}</div>
        {footer && (
          <div className="px-6 sm:px-12 pb-8 sm:pb-10 pt-4 border-t border-border flex flex-wrap gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
