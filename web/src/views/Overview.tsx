import { PulseStrip } from '../components/PulseStrip'
import { Engagements } from '../components/Engagements'
import { SignalColumn, LedgerPreview } from '../components/RightRail'
import type { ViewId } from '../types'

export function OverviewView({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  return (
    <>
      <section className="band band-1">
        <div className="eyebrow">FRIDAY · 24 APRIL · MONACO</div>
        <h1 className="mt-4 font-serif font-normal text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
          Good evening, Varvara.
        </h1>
      </section>

      <div className="mt-16 band band-2">
        <PulseStrip />
      </div>

      <div className="mt-20 grid grid-cols-12 gap-8">
        <div className="col-span-8 band band-3">
          <Engagements onOpen={() => onNavigate('projects')} />
        </div>
        <div className="col-span-4 flex flex-col gap-8 band band-4">
          <SignalColumn onOpen={() => onNavigate('comms')} />
          <LedgerPreview />
        </div>
      </div>
    </>
  )
}
