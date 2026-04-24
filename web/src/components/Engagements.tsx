import { engagements } from '../data'
import { useI18n } from '../i18n'

export function Engagements({ onOpen }: { onOpen?: () => void }) {
  const { t } = useI18n()
  return (
    <section>
      <header className="flex items-baseline justify-between mb-6 md:mb-8">
        <h2 className="serif-headline text-[22px] md:text-[28px]">{t('engagements.title')}</h2>
        <button
          onClick={onOpen}
          className="eyebrow hover:text-bronze transition-colors duration-200 ease-luxe touch-target"
        >
          {t('engagements.viewAll')}
        </button>
      </header>

      <div className="flex flex-col gap-5 md:gap-6">
        {engagements.map((e) => (
          <article
            key={e.client}
            onClick={onOpen}
            className="card-hover panel px-6 py-6 md:px-12 md:py-8 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-[18px] md:text-[22px] text-ink-primary">
                {e.client}
              </h3>
              <span
                className={
                  e.status === 'ON HOLD' ? 'pill-muted' : 'pill'
                }
              >
                {t(`status.${e.status}`)}
              </span>
            </div>

            <div className="mt-2 eyebrow tracking-label text-ink-secondary">
              {e.service}
            </div>

            <div className="mt-8 md:mt-10 h-px bg-white/10 relative">
              <div
                className="absolute left-0 top-0 h-px bg-bronze"
                style={{ width: `${e.progress * 100}%` }}
              />
            </div>

            <div className="mt-5 md:mt-6 grid grid-cols-3 gap-4 md:gap-8">
              <div>
                <div className="eyebrow mb-1">{t('field.stage')}</div>
                <div className="font-serif text-[14px] md:text-[15px] text-ink-primary tabular-nums">
                  {e.stage}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1">{t('field.due')}</div>
                <div className="font-serif text-[14px] md:text-[15px] text-ink-primary">
                  {e.due}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1">{t('field.pm')}</div>
                <div className="font-serif text-[14px] md:text-[15px] text-ink-primary truncate">
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
