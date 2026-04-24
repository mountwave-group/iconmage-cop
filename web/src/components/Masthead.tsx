import type { ViewId } from '../types'

const nav: { id: ViewId; label: string }[] = [
  { id: 'clients', label: 'Clients' },
  { id: 'projects', label: 'Projects' },
  { id: 'comms', label: 'Comms' },
  { id: 'finance', label: 'Finance' },
  { id: 'archive', label: 'Archive' },
]

export function Masthead({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (view: ViewId) => void
}) {
  return (
    <header className="h-20 border-b border-bronze-line flex items-center px-24 justify-between">
      <button
        onClick={() => onSelect('overview')}
        className="font-serif text-[18px] tracking-wordmark text-ink-primary"
      >
        ICON IMAGE
      </button>
      <nav className="flex items-center gap-8">
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
              {item.label}
              <span
                className={`absolute left-0 -bottom-1 h-px bg-bronze transition-all duration-200 ease-luxe ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          )
        })}
      </nav>
      <div className="flex items-center gap-6">
        <span className="eyebrow">⌘ K</span>
        <div className="h-8 w-8 rounded-full border border-bronze flex items-center justify-center font-serif text-[13px] text-bronze">
          VF
        </div>
      </div>
    </header>
  )
}
