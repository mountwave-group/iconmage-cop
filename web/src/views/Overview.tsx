import { PulseStrip } from '../components/PulseStrip'
import { Engagements } from '../components/Engagements'
import { SignalColumn, LedgerPreview } from '../components/RightRail'
import { brand } from '../brand'
import type { ViewId } from '../types'
import { useI18n } from '../i18n'

export function OverviewView({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const { t } = useI18n()
  return (
    <>
      <section className="band band-1 relative overflow-hidden">
        <img
          src={brand.serpent}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -right-12 -top-20 w-[220px] md:w-[320px] opacity-[0.06]"
          draggable={false}
        />
        <div className="relative">
          <div className="eyebrow">{t('overview.dateline')}</div>
          <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
            {t('overview.greeting')}
          </h1>
        </div>
      </section>

      <div className="mt-10 md:mt-16 band band-2">
        <PulseStrip />
      </div>

      <div className="mt-12 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 band band-3">
          <Engagements onOpen={() => onNavigate('projects')} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8 band band-4">
          <SignalColumn onOpen={() => onNavigate('comms')} />
          <LedgerPreview />
        </div>
      </div>
    </>
  )
}
