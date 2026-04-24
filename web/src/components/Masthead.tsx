import type { ViewId } from '../types'
import { brand } from '../brand'
import { useI18n } from '../i18n'
import { LocaleSwitcher } from './LocaleSwitcher'

export function Masthead({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (view: ViewId) => void
}) {
  const { t } = useI18n()
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
      <div className="flex items-center gap-3 md:gap-5">
        <LocaleSwitcher />
        <span className="hidden lg:inline eyebrow">⌘ K</span>
        <div className="h-9 w-9 md:h-8 md:w-8 rounded-full border border-bronze flex items-center justify-center font-serif text-[13px] text-bronze">
          VF
        </div>
      </div>
    </header>
  )
}
