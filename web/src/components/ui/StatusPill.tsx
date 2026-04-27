type Tone = 'active' | 'complete' | 'pending' | 'critical' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  active: 'border-status-active text-status-active',
  complete: 'border-status-complete text-status-complete',
  pending: 'border-status-pending text-status-pending',
  critical: 'border-status-critical text-status-critical',
  muted: 'border-white/15 text-ink-muted',
}

export function StatusPill({ tone = 'active', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center border ${TONE_CLASS[tone]} rounded-luxe px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em]`}
    >
      {children}
    </span>
  )
}
