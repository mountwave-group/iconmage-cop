import { useMemo, useState } from 'react'
import {
  useClients,
  useProjects,
  clientsApi,
  type ClientResource,
  type ClientStatus,
  type ClientTier,
} from '../api/resources'
import { useAuth } from '../auth/AuthContext'
import { can } from '../auth/permissions'
import { useI18n } from '../i18n'
import { ApiError } from '../api/client'
import {
  Button,
  ConfirmDialog,
  Select,
  StatusPill,
  useToast,
  Skeleton,
} from '../components/ui'
import { ClientFormModal } from './clients/ClientFormModal'

const STATUS_FILTER: { value: '' | ClientStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DORMANT', label: 'Dormant' },
  { value: 'ARCHIVED', label: 'Archived' },
]
const TIER_FILTER: { value: '' | ClientTier; label: string }[] = [
  { value: '', label: 'All tiers' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'VIP', label: 'VIP' },
]

function statusTone(status: ClientStatus) {
  switch (status) {
    case 'ACTIVE': return 'active' as const
    case 'LEAD': return 'pending' as const
    case 'DORMANT': return 'muted' as const
    case 'ARCHIVED': return 'muted' as const
  }
}

export function ClientsView({ onOpenProjects }: { onOpenProjects: (clientName: string) => void }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const { data: clientsData, error, loading, refetch } = useClients()
  const { data: projectsData } = useProjects()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'' | ClientStatus>('')
  const [tierFilter, setTierFilter] = useState<'' | ClientTier>('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ClientResource | null>(null)
  const [confirmArchive, setConfirmArchive] = useState<ClientResource | null>(null)
  const [archiving, setArchiving] = useState(false)

  const all = useMemo(() => clientsData?.items ?? [], [clientsData])
  const filtered = useMemo(() => {
    return all.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false
      if (tierFilter && c.tier !== tierFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !c.country.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [all, statusFilter, tierFilter, search])

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (client: ClientResource) => { setEditing(client); setFormOpen(true) }

  const onArchive = async () => {
    if (!confirmArchive) return
    setArchiving(true)
    try {
      await clientsApi.archive(confirmArchive.id)
      toast.success('Client archived.', confirmArchive.name)
      setConfirmArchive(null)
      refetch()
    } catch (err) {
      toast.error('Archive failed.', err instanceof ApiError ? err.message : 'Try again.')
    } finally {
      setArchiving(false)
    }
  }

  return (
    <>
      <section className="band band-1">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="eyebrow">
              {t('clients.eyebrow', { count: filtered.length.toString().padStart(2, '0') })}
            </div>
            <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
              {t('clients.title')}
            </h1>
          </div>
          {can(user, 'client.create') && (
            <Button variant="primary" onClick={openCreate}>New client</Button>
          )}
        </div>
      </section>

      {/* Filter bar */}
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 band band-2">
        <input
          className="field"
          placeholder="Search by name or country"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | ClientStatus)}
          options={STATUS_FILTER}
        />
        <Select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as '' | ClientTier)}
          options={TIER_FILTER}
        />
      </section>

      {loading && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="lg:col-span-7 h-72" />
        </div>
      )}

      {error && (
        <div className="mt-10 eyebrow text-status-critical" role="alert">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-10 eyebrow text-ink-secondary">
          {all.length === 0 ? 'No clients yet.' : 'No matches for current filters.'}
        </div>
      )}

      {selected && (
        <div className="mt-10 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 band band-3">
          <div className="lg:col-span-5">
            <div className="panel">
              {filtered.map((c, i) => {
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
                      <div className="font-serif text-[17px] md:text-[20px] text-ink-primary truncate">
                        {c.name}
                      </div>
                      <StatusPill tone={statusTone(c.status)}>{c.status}</StatusPill>
                    </div>
                    <div className="mt-1 eyebrow">
                      {c.country} · {t(`tier.${c.tier}`)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <ClientDrawer
              client={selected}
              relatedCount={
                projectsData?.items.filter((p) => p.clientId === selected.id).length ?? 0
              }
              onOpenProjects={() => onOpenProjects(selected.name)}
              onEdit={() => openEdit(selected)}
              onArchive={() => setConfirmArchive(selected)}
            />
          </div>
        </div>
      )}

      <ClientFormModal
        open={formOpen}
        client={editing}
        canSeeNotes={can(user, 'client.notes.read')}
        onClose={() => setFormOpen(false)}
        onSaved={(c) => { setSelectedId(c.id); refetch() }}
      />

      <ConfirmDialog
        open={!!confirmArchive}
        title="Archive client?"
        body={`This will move ${confirmArchive?.name ?? 'this client'} to the archive. Active engagements remain accessible to assigned PMs but no new work can be initiated.`}
        confirmLabel="Archive"
        destructive
        loading={archiving}
        onConfirm={onArchive}
        onClose={() => setConfirmArchive(null)}
      />
    </>
  )
}

function ClientDrawer({
  client,
  relatedCount,
  onOpenProjects,
  onEdit,
  onArchive,
}: {
  client: ClientResource
  relatedCount: number
  onOpenProjects: () => void
  onEdit: () => void
  onArchive: () => void
}) {
  const { t } = useI18n()
  const { user } = useAuth()
  const canViewFinance = can(user, 'project.budget.read')
  const canEdit = can(user, 'client.update')
  const canArchive = can(user, 'client.archive')
  const canSeeNotes = can(user, 'client.notes.read')

  return (
    <section className="panel px-6 py-8 md:px-12 md:py-10 band band-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="eyebrow">
            {client.country} · {t(`tier.${client.tier}`)}
          </div>
          <h2 className="mt-3 font-serif text-[24px] md:text-[32px] text-ink-primary">
            {client.name}
          </h2>
          <div className="mt-3"><StatusPill tone={statusTone(client.status)}>{client.status}</StatusPill></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && <Button variant="secondary" onClick={onEdit}>Edit</Button>}
          {canArchive && client.status !== 'ARCHIVED' && (
            <Button variant="ghost" onClick={onArchive}>Archive</Button>
          )}
        </div>
      </div>

      <div className="mt-8 md:mt-10 grid grid-cols-2 gap-6 md:gap-10">
        <div>
          <div className="eyebrow">{t('clients.primaryContact')}</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary">{client.primaryContact}</div>
          {client.contactTitle && (
            <div className="eyebrow mt-1 tracking-label">{client.contactTitle}</div>
          )}
        </div>
        <div>
          <div className="eyebrow">{t('clients.sinceLabel')}</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
            {new Date(client.createdAt).getFullYear()}
          </div>
        </div>
        <div>
          <div className="eyebrow">{t('clients.activeEngagements')}</div>
          <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
            {relatedCount.toString().padStart(2, '0')}
          </div>
        </div>
        {canViewFinance && (
          <div>
            <div className="eyebrow">{t('clients.lifetimeValue')}</div>
            <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">
              {client.currency} —
            </div>
          </div>
        )}
      </div>

      {canSeeNotes && client.notes && (
        <div className="mt-10 pt-8 border-t border-bronze-line">
          <div className="eyebrow">{t('clients.notes')}</div>
          <p className="mt-3 text-[14px] leading-[1.7] text-ink-secondary max-w-xl whitespace-pre-line">
            {client.notes}
          </p>
        </div>
      )}

      {relatedCount > 0 && (
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
        </div>
      )}
    </section>
  )
}
