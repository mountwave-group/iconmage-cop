import { kpis } from '../data'
import { useI18n } from '../i18n'

const LABEL_KEY: Record<string, string> = {
  'ACTIVE ENGAGEMENTS': 'kpi.activeEngagements',
  'PENDING APPROVALS': 'kpi.pendingApprovals',
  'INBOUND SIGNALS · 24H': 'kpi.inbound24h',
  'PORTFOLIO VALUE': 'kpi.portfolioValue',
}
const DELTA_KEY: Record<string, string> = {
  '↑ 3 vs. last week': 'kpi.delta.engagements',
  '2 require owner': 'kpi.delta.approvals',
  '↑ 11 vs. yesterday': 'kpi.delta.inbound',
  'APR — RUNNING': 'kpi.delta.portfolio',
}

export function PulseStrip() {
  const { t } = useI18n()
  return (
    <div className="border-t border-b border-bronze-line">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={`h-28 md:h-32 px-5 md:px-8 flex flex-col justify-center ${
              i > 0 ? 'md:border-l md:border-white/10' : ''
            } ${i % 2 === 1 ? 'border-l border-white/10 md:border-l' : ''} ${
              i >= 2 ? 'border-t border-white/10 md:border-t-0' : ''
            }`}
          >
            <div className="eyebrow mb-2">{t(LABEL_KEY[k.label] ?? '')}</div>
            <div className="font-serif font-light text-[34px] md:text-[48px] leading-none text-ink-primary tabular-nums">
              {k.value}
            </div>
            <div className="mt-2 text-[10px] md:text-[11px] tracking-eyebrow text-ink-muted uppercase">
              {t(DELTA_KEY[k.delta] ?? '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
