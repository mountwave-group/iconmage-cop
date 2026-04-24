import { signals, ledger } from '../data'
import { useI18n } from '../i18n'

export function SignalColumn({ onOpen }: { onOpen?: () => void }) {
  const { t } = useI18n()
  return (
    <section className="panel">
      <header className="flex items-baseline justify-between px-8 pt-8 pb-6">
        <h2 className="serif-headline text-[22px]">{t('signals.title')}</h2>
        <button
          onClick={onOpen}
          className="eyebrow hover:text-bronze transition-colors duration-200 ease-luxe"
        >
          {t('signals.last24h')}
        </button>
      </header>
      <ul>
        {signals.map((s, i) => (
          <li
            key={s.subject}
            onClick={onOpen}
            className={`flex items-start gap-5 px-8 py-5 cursor-pointer hover:bg-bg-elevated transition-colors duration-200 ease-luxe ${
              i > 0 ? 'border-t border-white/10' : ''
            }`}
          >
            <span className="font-serif text-[14px] text-bronze w-5 shrink-0 mt-0.5">
              {s.source}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-[15px] text-ink-primary truncate">
                {s.subject}
              </div>
            </div>
            <span className="eyebrow shrink-0">{s.time}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function LedgerPreview() {
  const { t } = useI18n()
  return (
    <section className="panel">
      <header className="flex items-baseline justify-between px-8 pt-8 pb-6">
        <h2 className="serif-headline text-[22px]">{t('ledger.title')}</h2>
        <span className="eyebrow">{t('ledger.monthApril')}</span>
      </header>
      <ul className="px-8">
        {ledger.map((l, i) => (
          <li
            key={l.party}
            className={`flex items-center gap-4 py-4 ${
              i > 0 ? 'border-t border-white/10' : ''
            }`}
          >
            <span className="font-serif text-[18px] text-bronze w-4">
              {l.glyph}
            </span>
            <span className="flex-1 text-ink-secondary text-[13px] truncate">
              {l.party}
            </span>
            <span className="font-serif text-[20px] text-ink-primary tabular-nums">
              {l.amount}
            </span>
          </li>
        ))}
      </ul>
      <div className="px-8 pt-6 pb-8">
        <div className="relative h-px bg-white/10">
          <div className="absolute left-0 top-0 h-px bg-bronze w-[80%]" />
        </div>
        <div className="mt-3 flex justify-between eyebrow">
          <span>{t('ledger.rangeStart')}</span>
          <span>{t('ledger.rangeEnd')}</span>
        </div>
      </div>
    </section>
  )
}
