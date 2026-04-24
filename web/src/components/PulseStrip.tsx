import { kpis } from '../data'

export function PulseStrip() {
  return (
    <div className="border-t border-b border-bronze-line">
      <div className="grid grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={`h-32 px-8 flex flex-col justify-center ${
              i > 0 ? 'border-l border-white/10' : ''
            }`}
          >
            <div className="eyebrow mb-2">{k.label}</div>
            <div className="font-serif font-light text-[48px] leading-none text-ink-primary tabular-nums">
              {k.value}
            </div>
            <div className="mt-2 text-[11px] tracking-eyebrow text-ink-muted uppercase">
              {k.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
