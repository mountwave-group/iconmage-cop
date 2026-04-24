import { useState } from 'react'
import { clients, projects, canViewFinance, currentRole } from '../data'
import type { Client } from '../data'
import { useI18n } from '../i18n'

export function ClientsView({ onOpenProjects }: { onOpenProjects: (clientName: string) => void }) {
  const { t } = useI18n()
  const [selectedId, setSelectedId] = useState<string>(clients[0].id)
  const selected = clients.find((c) => c.id === selectedId) ?? clients[0]

  return (
    <>
      <section className="band band-1">
        <div className="eyebrow">{t('clients.eyebrow', { count: clients.length.toString().padStart(2, '0') })}</div>
        <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
          {t('clients.title')}
        </h1>
      </section>

      <div className="mt-10 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 band band-2">
        <div className="lg:col-span-5">
          <div className="panel">
            {clients.map((c, i) => {
              const isActive = c.id === selected.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-6 py-5 md:px-8 md:py-6 ${
                    i > 0 ? 'border-t border-white/10' : ''
                  } transition-colors duration-200 ease-luxe ${
                    isActive ? 'bg-bg-elevated' : 'hover:bg-bg-elevated'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-serif text-[17px] md:text-[20px] text-ink-primary truncate">{c.name}</div>
                    <span
                      className={
                        c.tier === 'VIP'
                          ? 'pill'
                          : 'pill-muted'
                      }
                    >
                      {t(`tier.${c.tier}`)}
                    </span>
                  </div>
                  <div className="mt-1 eyebrow">
                    {c.country} · {t('clients.since', { year: c.since })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-7">
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
  const { t } = useI18n()
  const related = projects.filter((p) => p.client === client.name)

  return (
    <section className="panel px-6 py-8 md:px-12 md:py-10 band band-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">{client.country} · {t(`tier.${client.tier}`)}</div>
          <h2 className="mt-3 font-serif text-[24px] md:text-[32px] text-ink-primary">{client.name}</h2>
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

      <div className="mt-8 md:mt-10 grid grid-cols-2 gap-6 md:gap-10">
        <div>
          <div className="eyebrow">{t('clients.primaryContact')}</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary">{client.primaryContact}</div>
          <div className="eyebrow mt-1 tracking-label">{client.contactTitle}</div>
        </div>
        <div>
          <div className="eyebrow">{t('clients.sinceLabel')}</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">{client.since}</div>
        </div>
        <div>
          <div className="eyebrow">{t('clients.activeEngagements')}</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
            {client.activeProjects.toString().padStart(2, '0')}
          </div>
        </div>
        {canViewFinance(currentRole) && (
          <div>
            <div className="eyebrow">{t('clients.lifetimeValue')}</div>
            <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
              {client.currency} {client.lifetimeValue}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-bronze-line">
        <div className="eyebrow">{t('clients.notes')}</div>
        <p className="mt-3 text-[14px] leading-[1.7] text-ink-secondary max-w-xl">
          {client.notes}
        </p>
      </div>

      {related.length > 0 && (
        <div className="mt-10 pt-8 border-t border-bronze-line">
          <div className="flex items-baseline justify-between mb-6">
            <div className="eyebrow">{t('clients.related')}</div>
            <button
              onClick={onOpenProjects}
              className="eyebrow hover:text-bronze transition-colors duration-200 ease-luxe"
            >
              {t('clients.openRoadmaps')}
            </button>
          </div>
          <ul className="space-y-4">
            {related.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between">
                <div>
                  <div className="font-serif text-[16px] text-ink-primary">{p.service}</div>
                  <div className="eyebrow mt-0.5 tracking-label">
                    {t('clients.stageDuePm', { stage: p.stage, due: p.due, pm: p.pm })}
                  </div>
                </div>
                <span className={p.status === 'ON HOLD' ? 'pill-muted' : 'pill'}>{t(`status.${p.status}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
