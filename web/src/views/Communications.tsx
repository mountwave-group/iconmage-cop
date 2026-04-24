import { useState, useMemo } from 'react'
import { signalThreads } from '../data'
import type { Signal } from '../data'

type Filter = 'ALL' | 'UNREAD' | 'FLAGGED'

export function CommunicationsView() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [selectedId, setSelectedId] = useState<string>(signalThreads[0].id)
  const [reply, setReply] = useState('')

  const filtered = useMemo(() => {
    if (filter === 'UNREAD') return signalThreads.filter((s) => s.unread)
    if (filter === 'FLAGGED') return signalThreads.filter((s) => s.source === 'W' || s.source === 'T')
    return signalThreads
  }, [filter])

  const selected = signalThreads.find((s) => s.id === selectedId) ?? signalThreads[0]

  return (
    <>
      <section className="band band-1 flex items-end justify-between">
        <div>
          <div className="eyebrow">COMMUNICATIONS · UNIFIED INBOX</div>
          <h1 className="mt-4 font-serif font-normal text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
            Signals &amp; correspondence.
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {(['ALL', 'UNREAD', 'FLAGGED'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`eyebrow px-4 py-2 border transition-colors duration-200 ease-luxe ${
                filter === f
                  ? 'border-bronze text-bronze'
                  : 'border-white/10 text-ink-muted hover:text-ink-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-16 grid grid-cols-12 gap-8 band band-2">
        <div className="col-span-5">
          <ul className="panel">
            {filtered.map((s, i) => {
              const isActive = s.id === selected.id
              return (
                <li
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`cursor-pointer px-8 py-6 ${
                    i > 0 ? 'border-t border-white/10' : ''
                  } transition-colors duration-200 ease-luxe ${
                    isActive ? 'bg-bg-elevated' : 'hover:bg-bg-elevated'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <span className="font-serif text-[22px] text-bronze w-6 shrink-0">
                      {s.source}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="font-serif text-[16px] text-ink-primary truncate">
                          {s.sender}
                        </div>
                        <div className="eyebrow tabular-nums shrink-0">{s.time}</div>
                      </div>
                      <div
                        className={`mt-1 text-[13px] truncate ${
                          s.unread ? 'text-ink-primary' : 'text-ink-secondary'
                        }`}
                      >
                        {s.subject}
                      </div>
                      <div className="eyebrow mt-1 truncate tracking-label">
                        {s.sourceLabel}
                        {s.client ? ` · ${s.client.toUpperCase()}` : ''}
                      </div>
                    </div>
                    {s.unread && (
                      <span className="w-1 h-1 rounded-full bg-bronze mt-3 shrink-0" />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="col-span-7">
          <ThreadDetail signal={selected} reply={reply} onReply={setReply} />
        </div>
      </div>
    </>
  )
}

function ThreadDetail({
  signal,
  reply,
  onReply,
}: {
  signal: Signal
  reply: string
  onReply: (v: string) => void
}) {
  return (
    <section className="panel px-12 py-10 band band-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow">
            {signal.sourceLabel}
            {signal.client ? ` · ${signal.client.toUpperCase()}` : ''}
          </div>
          <h2 className="mt-3 font-serif text-[28px] text-ink-primary leading-[1.2]">
            {signal.subject}
          </h2>
        </div>
        <div className="eyebrow tabular-nums">{signal.time}</div>
      </div>

      <div className="mt-10 pt-8 border-t border-bronze-line">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-serif text-[18px] text-ink-primary">{signal.sender}</div>
            <div className="eyebrow mt-0.5 tracking-label">INBOUND</div>
          </div>
        </div>
        <p className="mt-6 text-[14px] leading-[1.8] text-ink-secondary max-w-2xl">
          {signal.preview}
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-bronze-line">
        <div className="eyebrow mb-4">REPLY · AI DRAFT</div>
        <textarea
          value={reply}
          onChange={(e) => onReply(e.target.value)}
          placeholder="Compose a reply, or invite the AI to draft one — all outbound passes through PM approval."
          className="w-full min-h-[120px] bg-transparent border border-white/10 focus:border-bronze-line outline-none px-6 py-5 text-[14px] leading-[1.7] text-ink-primary placeholder:text-ink-muted transition-colors duration-200 ease-luxe resize-none"
        />
        <div className="mt-4 flex items-center gap-3">
          <button className="eyebrow px-5 py-2 border border-bronze-line text-bronze hover:bg-bronze/5 transition-colors duration-200 ease-luxe">
            GENERATE DRAFT
          </button>
          <button className="eyebrow px-5 py-2 border border-white/10 text-ink-secondary hover:border-white/20 transition-colors duration-200 ease-luxe">
            SEND TO PM
          </button>
          <div className="eyebrow ml-auto tracking-label">
            CHAIN · AI → PERFORMER → PM → OWNER
          </div>
        </div>
      </div>
    </section>
  )
}
