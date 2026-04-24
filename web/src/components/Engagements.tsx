import { engagements } from '../data'

export function Engagements({ onOpen }: { onOpen?: () => void }) {
  return (
    <section>
      <header className="flex items-baseline justify-between mb-8">
        <h2 className="serif-headline text-[28px]">Active Engagements</h2>
        <button
          onClick={onOpen}
          className="eyebrow hover:text-bronze transition-colors duration-200 ease-luxe"
        >
          VIEW ALL —
        </button>
      </header>

      <div className="flex flex-col gap-6">
        {engagements.map((e) => (
          <article
            key={e.client}
            onClick={onOpen}
            className="card-hover panel px-12 py-8 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-[22px] text-ink-primary">
                {e.client}
              </h3>
              <span
                className={
                  e.status === 'ON HOLD' ? 'pill-muted' : 'pill'
                }
              >
                {e.status}
              </span>
            </div>

            <div className="mt-2 eyebrow tracking-label text-ink-secondary">
              {e.service}
            </div>

            <div className="mt-10 h-px bg-white/10 relative">
              <div
                className="absolute left-0 top-0 h-px bg-bronze"
                style={{ width: `${e.progress * 100}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-8">
              <div>
                <div className="eyebrow mb-1">STAGE</div>
                <div className="font-serif text-[15px] text-ink-primary tabular-nums">
                  {e.stage}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1">DUE</div>
                <div className="font-serif text-[15px] text-ink-primary">
                  {e.due}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1">PROJECT MANAGER</div>
                <div className="font-serif text-[15px] text-ink-primary">
                  {e.pm}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
