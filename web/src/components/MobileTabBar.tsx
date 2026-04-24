import type { ViewId } from '../types'
import { useI18n } from '../i18n'

// Mobile bottom tab bar — Material-aligned (≥48px touch targets)
// with luxury treatment (thin bronze accent, serif labels).
// Finance & Archive stay reachable via Overview placeholders; the
// bottom rail holds the five primary journeys.
const tabs: { id: ViewId; labelKey: string }[] = [
  { id: 'overview', labelKey: 'nav.overview' },
  { id: 'clients', labelKey: 'nav.clients' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'comms', labelKey: 'nav.commsShort' },
  { id: 'finance', labelKey: 'nav.finance' },
]

export function MobileTabBar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (v: ViewId) => void
}) {
  const { t } = useI18n()
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-inset/95 backdrop-blur border-t border-bronze-line pb-safe"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <li key={tab.id}>
              <button
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-full h-14 flex items-center justify-center font-serif text-[13px] transition-colors duration-200 ease-luxe ${
                  isActive ? 'text-ink-primary' : 'text-ink-muted'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-8 bg-bronze"
                  />
                )}
                <span className="truncate px-1">{t(tab.labelKey)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
