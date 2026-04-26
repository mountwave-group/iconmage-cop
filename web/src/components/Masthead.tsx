import { useEffect, useRef, useState } from 'react'
import type { ViewId } from '../types'
import { brand } from '../brand'
import { useI18n } from '../i18n'
import { useAuth } from '../auth/AuthContext'
import { LocaleSwitcher } from './LocaleSwitcher'

export function Masthead({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (view: ViewId) => void
}) {
  const { t } = useI18n()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const initials =
    (user?.fullName ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '·'

  const nav: { id: ViewId; labelKey: string }[] = [
    { id: 'clients', labelKey: 'nav.clients' },
    { id: 'projects', labelKey: 'nav.projects' },
    { id: 'comms', labelKey: 'nav.commsShort' },
    { id: 'finance', labelKey: 'nav.finance' },
    { id: 'archive', labelKey: 'nav.archive' },
  ]
  return (
    <header className="h-16 md:h-20 border-b border-bronze-line flex items-center px-5 md:px-24 justify-between pt-safe">
      <button
        onClick={() => onSelect('overview')}
        className="flex items-center gap-3 text-ink-primary touch-target"
        aria-label={`${t('brand.name')} — ${t('nav.overview')}`}
      >
        <img
          src={brand.serpent}
          alt=""
          className="h-6 w-6 md:h-7 md:w-7 opacity-90"
          draggable={false}
        />
        <span className="font-serif text-[15px] md:text-[18px] tracking-wordmark">
          {t('brand.name')}
        </span>
      </button>
      <nav className="hidden md:flex items-center gap-8">
        {nav.map((item) => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group relative font-serif text-[15px] transition-colors duration-200 ease-luxe ${
                isActive ? 'text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {t(item.labelKey)}
              <span
                className={`absolute left-0 -bottom-1 h-px bg-bronze transition-all duration-200 ease-luxe ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          )
        })}
      </nav>
      <div ref={menuRef} className="flex items-center gap-3 md:gap-5 relative">
        <LocaleSwitcher />
        <span className="hidden lg:inline eyebrow">⌘ K</span>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={user?.fullName ?? 'Account'}
          title={user?.fullName ?? ''}
          className="h-9 w-9 md:h-8 md:w-8 rounded-full border border-bronze flex items-center justify-center font-serif text-[13px] text-bronze hover:bg-bronze/5 transition-colors duration-200 ease-luxe"
        >
          {initials}
        </button>
        {menuOpen && user && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-3 min-w-[260px] panel px-5 py-4 z-50 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="eyebrow text-bronze">
              {t('login.session.signedInAs', {
                role: t(`login.role.${user.role}`),
              })}
            </div>
            <div className="mt-2">
              <div className="eyebrow text-ink-muted">{t('login.name')}</div>
              <div className="mt-1 font-serif text-[15px] text-ink-primary truncate">
                {user.fullName}
              </div>
            </div>
            <div className="mt-3">
              <div className="eyebrow text-ink-muted">{t('login.email')}</div>
              <div className="mt-1 font-sans text-[12px] tracking-label text-ink-secondary truncate">
                {user.email}
              </div>
            </div>
            <div className="mt-4 border-t border-bronze-line/40 pt-3 flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onSelect('settings')
                }}
                className="text-left eyebrow py-2 text-ink-secondary hover:text-bronze transition-colors duration-200"
              >
                {t('login.session.openSettings')} —
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  void signOut()
                }}
                className="text-left eyebrow py-2 text-ink-secondary hover:text-bronze transition-colors duration-200"
              >
                {t('login.session.signOut')} —
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
