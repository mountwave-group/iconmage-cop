import type { ViewId } from '../types'

const items: { id: ViewId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'clients', label: 'Clients' },
  { id: 'projects', label: 'Projects' },
  { id: 'comms', label: 'Communications' },
  { id: 'finance', label: 'Finance' },
  { id: 'archive', label: 'Archive' },
]

export function Sidebar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (view: ViewId) => void
}) {
  return (
    <aside className="w-60 shrink-0 bg-bg-inset border-r border-bronze-line min-h-[calc(100vh-80px)] pt-16">
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
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="mt-16 mx-14 h-px bg-white/10" />
      <button className="mt-6 text-left font-serif text-[15px] leading-[28px] py-2 pl-14 pr-6 text-ink-muted hover:text-ink-primary transition-colors duration-200 ease-luxe">
        Settings
      </button>
    </aside>
  )
}
