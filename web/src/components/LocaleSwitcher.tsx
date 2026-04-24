import { useEffect, useRef, useState } from 'react'
import { useI18n, LOCALES, type Locale } from '../i18n'

// Luxury-register language switcher.
// Thin-outline trigger in bronze · dropdown with muted surface ·
// dismissible via outside-click / Escape. 44px touch target.
export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (l: Locale) => {
    setLocale(l)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="touch-target inline-flex items-center gap-1.5 px-3 h-9 rounded-luxe border border-bronze-line text-bronze font-serif text-[12px] tracking-label hover:bg-bronze/5 transition-colors duration-200 ease-luxe"
      >
        <span className="tabular-nums">{locale}</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          className={`transition-transform duration-200 ease-luxe ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path
            d="M1 2.5L4 5.5L7 2.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 mt-2 min-w-[7rem] bg-bg-surface border border-bronze-line rounded-luxe shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
        >
          {LOCALES.map((l: Locale) => {
            const isActive = l === locale
            return (
              <li key={l} role="option" aria-selected={isActive}>
                <button
                  onClick={() => choose(l)}
                  className={`w-full text-left px-4 py-3 font-serif text-[13px] tracking-label transition-colors duration-200 ease-luxe flex items-center justify-between gap-4 ${
                    isActive
                      ? 'text-bronze bg-bronze/5'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-bg-elevated'
                  }`}
                >
                  <span>{LOCALE_LABEL[l]}</span>
                  <span className="eyebrow">{l}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const LOCALE_LABEL: Record<Locale, string> = {
  EN: 'English',
  FR: 'Français',
  RU: 'Русский',
}
