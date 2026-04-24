import type { ViewId } from '../types'
import { brand } from '../brand'
import { useI18n } from '../i18n'

export function Sidebar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (view: ViewId) => void
}) {
  const { t } = useI18n()
  const items: { id: ViewId; labelKey: string }[] = [
    { id: 'overview', labelKey: 'nav.overview' },
    { id: 'clients', labelKey: 'nav.clients' },
    { id: 'projects', labelKey: 'nav.projects' },
    { id: 'comms', labelKey: 'nav.comms' },
    { id: 'finance', labelKey: 'nav.finance' },
    { id: 'archive', labelKey: 'nav.archive' },
  ]
  return (
    <aside className="hidden md:block w-60 shrink-0 bg-bg-inset border-r border-bronze-line min-h-[calc(100vh-80px)] pt-16">
      <nav className="flex flex-col">
        {items.map((item) => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`relative text-left font-serif text-[15px] leading-[28px] py-2 pl-14 pr-6 transition-colors duration-200 ease-luxe ${
                isActive
                  ? 'text-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {isActive && (
                <span className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-px bg-bronze" />
              )}
              {t(item.labelKey)}
            </button>
          )
        })}
      </nav>
      <div className="mt-16 mx-14 h-px bg-white/10" />
      <button className="mt-6 text-left font-serif text-[15px] leading-[28px] py-2 pl-14 pr-6 text-ink-muted hover:text-ink-primary transition-colors duration-200 ease-luxe">
        {t('nav.settings')}
      </button>

      <div className="mt-24 flex justify-center pb-10 opacity-30">
        <img
          src={brand.serpent}
          alt=""
          aria-hidden
          className="h-10 w-10"
          draggable={false}
        />
      </div>
    </aside>
  )
}
