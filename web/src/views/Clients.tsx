import { useState } from 'react'
import { clients, projects, canViewFinance, currentRole } from '../data'
import type { Client } from '../data'

export function ClientsView({ onOpenProjects }: { onOpenProjects: (clientName: string) => void }) {
  const [selectedId, setSelectedId] = useState<string>(clients[0].id)
  const selected = clients.find((c) => c.id === selectedId) ?? clients[0]

  return (
    <>
      <section className="band band-1">
        <div className="eyebrow">CLIENTS · 05 ON FILE</div>
        <h1 className="mt-4 font-serif font-normal text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
          Client Registry.
        </h1>
      </section>

      <div className="mt-16 grid grid-cols-12 gap-8 band band-2">
        <div className="col-span-5">
          <div className="panel">
            {clients.map((c, i) => {
              const isActive = c.id === selected.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-8 py-6 ${
                    i > 0 ? 'border-t border-white/10' : ''
                  } transition-colors duration-200 ease-luxe ${
                    isActive ? 'bg-bg-elevated' : 'hover:bg-bg-elevated'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-serif text-[20px] text-ink-primary">{c.name}</div>
                    <span
                      className={
                        c.tier === 'VIP'
                          ? 'pill'
                          : 'pill-muted'
                      }
                    >
                      {c.tier}
                    </span>
                  </div>
                  <div className="mt-1 eyebrow">
                    {c.country} · SINCE {c.since}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="col-span-7">
          <ClientDrawer client={selected} onOpenProjects={() => onOpenProjects(selected.name)} />
        </div>
      </div>
    </>
  )
}

function ClientDrawer({
  client,
  onOpenProjects,
}: {
  client: Client
  onOpenProjects: () => void
}) {
  const related = projects.filter((p) => p.client === client.name)

  return (
    <section className="panel px-12 py-10 band band-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow">{client.country} · {client.tier}</div>
          <h2 className="mt-3 font-serif text-[32px] text-ink-primary">{client.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {client.channels.map((ch) => (
            <span
              key={ch}
              className="w-7 h-7 border border-bronze-line rounded-luxe flex items-center justify-center font-serif text-[13px] text-bronze"
              title={ch}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-10">
        <div>
          <div className="eyebrow">PRIMARY CONTACT</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary">{client.primaryContact}</div>
          <div className="eyebrow mt-1 tracking-label">{client.contactTitle}</div>
        </div>
        <div>
          <div className="eyebrow">SINCE</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">{client.since}</div>
        </div>
        <div>
          <div className="eyebrow">ACTIVE ENGAGEMENTS</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
            {client.activeProjects.toString().padStart(2, '0')}
          </div>
        </div>
        {canViewFinance(currentRole) && (
          <div>
            <div className="eyebrow">LIFETIME VALUE</div>
            <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
              {client.currency} {client.lifetimeValue}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-bronze-line">
        <div className="eyebrow">NOTES</div>
        <p className="mt-3 text-[14px] leading-[1.7] text-ink-secondary max-w-xl">
          {client.notes}
        </p>
      </div>

      {related.length > 0 && (
        <div className="mt-10 pt-8 border-t border-bronze-line">
          <div className="flex items-baseline justify-between mb-6">
            <div className="eyebrow">RELATED ENGAGEMENTS</div>
            <button
              onClick={onOpenProjects}
              className="eyebrow hover:text-bronze transition-colors duration-200 ease-luxe"
            >
              OPEN ROADMAPS —
            </button>
          </div>
          <ul className="space-y-4">
            {related.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between">
                <div>
                  <div className="font-serif text-[16px] text-ink-primary">{p.service}</div>
                  <div className="eyebrow mt-0.5 tracking-label">
                    STAGE {p.stage} · DUE {p.due} · PM {p.pm}
                  </div>
                </div>
                <span className={p.status === 'ON HOLD' ? 'pill-muted' : 'pill'}>{p.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
