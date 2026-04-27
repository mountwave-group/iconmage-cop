import { useEffect, useMemo, useState } from 'react'
import {
  useClients,
  useProjects,
  useProjectRoadmap,
  projectsApi,
  tasksApi,
  type ProjectResource,
  type ProjectStatus,
  type ServiceCategory,
  type TaskResource,
  type TaskStatus,
} from '../api/resources'
import { useAuth } from '../auth/AuthContext'
import { can } from '../auth/permissions'
import { useI18n } from '../i18n'
import { ApiError } from '../api/client'
import { serviceWordmarks } from '../brand'
import {
  Button,
  ConfirmDialog,
  Select,
  StatusPill,
  Skeleton,
  useToast,
} from '../components/ui'
import { ProjectFormModal } from './projects/ProjectFormModal'
import { TaskFormModal } from './projects/TaskFormModal'
import { FileUploader } from './projects/FileUploader'

const STATUS_FILTER: { value: '' | ProjectStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'IN_MOTION', label: 'In motion' },
  { value: 'AWAITING_APPROVAL', label: 'Awaiting approval' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'DELIVERED', label: 'Delivered' },
]
const CATEGORY_FILTER: { value: '' | ServiceCategory; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'BRANDING', label: 'Branding' },
  { value: 'CONTENT', label: 'Content' },
  { value: 'PR', label: 'PR' },
  { value: 'VIP', label: 'VIP' },
]

function projectStatusTone(s: ProjectStatus) {
  switch (s) {
    case 'IN_MOTION': return 'active' as const
    case 'AWAITING_APPROVAL': return 'pending' as const
    case 'ON_HOLD': return 'muted' as const
    case 'DELIVERED': return 'complete' as const
  }
}
function taskStatusTone(s: TaskStatus) {
  switch (s) {
    case 'IN_PROGRESS': return 'active' as const
    case 'PENDING': return 'pending' as const
    case 'BLOCKED': return 'critical' as const
    case 'COMPLETE': return 'complete' as const
  }
}

function formatStatus(s: string) {
  return s.replace(/_/g, ' ')
}
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return '—'
  }
}

export function ProjectsView({ focusClient }: { focusClient?: string | null }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const toast = useToast()

  const { data: projectsData, error, loading, refetch } = useProjects()
  const { data: clientsData } = useClients()

  const clients = useMemo(() => clientsData?.items ?? [], [clientsData])
  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])

  const [statusFilter, setStatusFilter] = useState<'' | ProjectStatus>('')
  const [categoryFilter, setCategoryFilter] = useState<'' | ServiceCategory>('')
  const [clientFilter, setClientFilter] = useState<string>('')

  // When user lands here from a client deep-link, lock the client filter
  useEffect(() => {
    if (focusClient) {
      const match = clients.find((c) => c.name === focusClient)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing filter to deep-link prop
      if (match) setClientFilter(match.id)
    }
  }, [focusClient, clients])

  const all = useMemo(() => projectsData?.items ?? [], [projectsData])
  const filtered = useMemo(() => {
    return all.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false
      if (categoryFilter && p.serviceCategory !== categoryFilter) return false
      if (clientFilter && p.clientId !== clientFilter) return false
      return true
    })
  }, [all, statusFilter, categoryFilter, clientFilter])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectResource | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ProjectResource | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (p: ProjectResource) => { setEditing(p); setFormOpen(true) }

  const onDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await projectsApi.remove(confirmDelete.id)
      toast.success('Project deleted.', confirmDelete.serviceName)
      setConfirmDelete(null)
      setSelectedId(null)
      refetch()
    } catch (err) {
      toast.error('Delete failed.', err instanceof ApiError ? err.message : 'Try again.')
    } finally {
      setDeleting(false)
    }
  }

  const count = filtered.length.toString().padStart(2, '0')

  return (
    <>
      <section className="band band-1">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="eyebrow">
              {focusClient
                ? t('projects.eyebrowForClient', { client: focusClient.toUpperCase(), count })
                : t('projects.eyebrow', { count })}
            </div>
            <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
              {t('projects.title')}
            </h1>
          </div>
          {can(user, 'project.create') && (
            <Button variant="primary" onClick={openCreate}>New project</Button>
          )}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 band band-2">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | ProjectStatus)}
          options={STATUS_FILTER}
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as '' | ServiceCategory)}
          options={CATEGORY_FILTER}
        />
        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          placeholder="All clients"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
        />
      </section>

      {loading && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-3">
            <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
          </div>
          <Skeleton className="lg:col-span-8 h-96" />
        </div>
      )}

      {error && (
        <div className="mt-10 eyebrow text-status-critical" role="alert">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-10 eyebrow text-ink-secondary">
          {all.length === 0 ? 'No projects yet.' : 'No matches for current filters.'}
        </div>
      )}

      {selected && (
        <div className="mt-10 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 band band-3">
          <div className="lg:col-span-4">
            <ul className="panel">
              {filtered.map((p, i) => {
                const isActive = p.id === selected.id
                const c = clientById.get(p.clientId)
                const progress = p.stageTotal > 0 ? p.stageCurrent / p.stageTotal : 0
                return (
                  <li
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`cursor-pointer px-6 py-5 md:px-8 md:py-6 ${
                      i > 0 ? 'border-t border-white/10' : ''
                    } transition-colors duration-200 ease-luxe ${
                      isActive ? 'bg-bg-elevated' : 'hover:bg-bg-elevated'
                    }`}
                  >
                    <div className="font-serif text-[18px] text-ink-primary">{c?.name ?? '—'}</div>
                    <div className="eyebrow mt-1 tracking-label truncate">{p.serviceName}</div>
                    <div className="mt-4 h-px bg-white/10 relative">
                      <div
                        className="absolute left-0 top-0 h-px bg-bronze transition-[width] duration-500 ease-decel"
                        style={{ width: `${Math.min(100, progress * 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between eyebrow">
                      <span>Stage {p.stageCurrent}/{p.stageTotal}</span>
                      <span>{formatStatus(p.status)}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <ProjectDetail
              project={selected}
              clientName={clientById.get(selected.clientId)?.name ?? '—'}
              onEdit={() => openEdit(selected)}
              onDelete={() => setConfirmDelete(selected)}
            />
          </div>
        </div>
      )}

      <ProjectFormModal
        open={formOpen}
        project={editing}
        clients={clients}
        defaultClientId={clientFilter || null}
        canSetBudget={can(user, 'project.budget.read')}
        onClose={() => setFormOpen(false)}
        onSaved={(p) => { setSelectedId(p.id); refetch() }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete project?"
        body={`This permanently removes ${confirmDelete?.serviceName ?? 'this project'} and its tasks. Files remain in storage.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={onDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  )
}

function ProjectDetail({
  project,
  clientName,
  onEdit,
  onDelete,
}: {
  project: ProjectResource
  clientName: string
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useI18n()
  const { user } = useAuth()
  const wordmark = serviceWordmarks[project.serviceCategory as keyof typeof serviceWordmarks]
  const canEdit = can(user, 'project.update')
  const canDelete = can(user, 'project.delete')
  const canSeeBudget = can(user, 'project.budget.read')

  return (
    <section className="panel px-6 py-8 md:px-12 md:py-10 band band-3 relative overflow-hidden">
      {wordmark && (
        <img
          src={wordmark}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-4 top-4 md:right-8 md:top-6 h-7 md:h-10 opacity-40"
          draggable={false}
        />
      )}
      <div className="flex items-start justify-between gap-4 relative flex-wrap">
        <div className="min-w-0">
          <div className="eyebrow truncate">{project.serviceName}</div>
          <h2 className="mt-3 font-serif text-[24px] md:text-[32px] text-ink-primary">{clientName}</h2>
          <div className="mt-3">
            <StatusPill tone={projectStatusTone(project.status as ProjectStatus)}>
              {formatStatus(project.status)}
            </StatusPill>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 relative">
          {canEdit && <Button variant="secondary" onClick={onEdit}>Edit</Button>}
          {canDelete && <Button variant="ghost" onClick={onDelete}>Delete</Button>}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <Meta label={t('field.stage')} value={`${project.stageCurrent}/${project.stageTotal}`} />
        <Meta label={t('field.due')} value={formatDate(project.dueAt)} />
        <Meta label="Category" value={project.serviceCategory} />
        {canSeeBudget && (
          <Meta
            label={t('field.budget')}
            value={
              project.budgetCents
                ? `${project.currency} ${(Number(project.budgetCents) / 100).toLocaleString()}`
                : '—'
            }
          />
        )}
      </div>

      {/* Stage timeline */}
      <div className="mt-12">
        <div className="eyebrow mb-4">{t('projects.roadmap')}</div>
        <div className="flex gap-1">
          {Array.from({ length: project.stageTotal }).map((_, idx) => {
            const stageNum = idx + 1
            const isDone = stageNum < project.stageCurrent
            const isNow = stageNum === project.stageCurrent
            return (
              <div
                key={idx}
                className={`flex-1 h-1 ${
                  isDone ? 'bg-bronze' : isNow ? 'bg-bronze/60' : 'bg-white/10'
                }`}
              />
            )
          })}
        </div>
        <div className="mt-3 flex justify-between eyebrow">
          <span>{t('projects.stage.first')}</span>
          <span>
            {t('projects.stage.last', { n: project.stageTotal.toString().padStart(2, '0') })}
          </span>
        </div>
      </div>

      <TasksSection projectId={project.id} />

      {can(user, 'storage.upload') && (
        <div className="mt-12 pt-8 border-t border-bronze-line">
          <div className="flex items-center justify-between mb-6">
            <div className="eyebrow">Files</div>
            <FileUploader projectId={project.id} clientId={project.clientId} />
          </div>
          <p className="text-[12px] text-ink-muted">
            PDF · DOCX · ZIP · PNG · JPEG · MP4 · up to 1 GB.
          </p>
        </div>
      )}
    </section>
  )
}

function TasksSection({ projectId }: { projectId: string }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const { data, loading, refetch } = useProjectRoadmap(projectId)

  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editing, setEditing] = useState<TaskResource | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const canEdit = can(user, 'task.update')
  const canCreate = can(user, 'task.create')

  const tasks = data?.tasks ?? []

  const advanceStatus = async (task: TaskResource, next: TaskStatus) => {
    setUpdatingId(task.id)
    try {
      await tasksApi.update(projectId, task.id, { status: next })
      toast.success('Task updated.', task.title)
      refetch()
    } catch (err) {
      toast.error('Update failed.', err instanceof ApiError ? err.message : 'Try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-bronze-line">
      <div className="flex items-baseline justify-between mb-6">
        <div className="eyebrow">{t('projects.tasks')}</div>
        {canCreate && (
          <Button variant="ghost" onClick={() => { setEditing(null); setTaskFormOpen(true) }}>
            New task
          </Button>
        )}
      </div>

      {loading && <Skeleton className="h-20" />}

      {!loading && tasks.length === 0 && (
        <div className="eyebrow text-ink-muted">No tasks yet.</div>
      )}

      <ul>
        {tasks.map((task, i) => (
          <li
            key={task.id}
            className={`grid grid-cols-12 gap-3 md:gap-4 items-baseline py-4 ${
              i > 0 ? 'border-t border-white/10' : ''
            }`}
          >
            <div className="col-span-2 md:col-span-1 eyebrow tabular-nums">
              {(i + 1).toString().padStart(2, '0')}
            </div>
            <div className="col-span-10 md:col-span-5 font-serif text-[14px] md:text-[15px] text-ink-primary">
              {task.title}
            </div>
            <div className="col-start-3 col-span-4 md:col-start-auto md:col-span-2 eyebrow tracking-label truncate">
              {task.assigneeRole}
            </div>
            <div className="col-span-3 md:col-span-2 eyebrow tabular-nums">
              {formatDate(task.dueAt)}
            </div>
            <div className="col-span-3 md:col-span-2 flex justify-end items-center gap-2">
              {canEdit ? (
                <select
                  className="bg-transparent border border-border rounded-luxe px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink-secondary focus:outline-none focus:border-border-accent"
                  value={task.status}
                  disabled={updatingId === task.id}
                  onChange={(e) => advanceStatus(task, e.target.value as TaskStatus)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="COMPLETE">Complete</option>
                </select>
              ) : (
                <StatusPill tone={taskStatusTone(task.status)}>
                  {formatStatus(task.status)}
                </StatusPill>
              )}
              {canEdit && (
                <button
                  onClick={() => { setEditing(task); setTaskFormOpen(true) }}
                  className="eyebrow text-ink-muted hover:text-ink-primary transition-colors duration-150"
                  aria-label="Edit task"
                >
                  Edit
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <TaskFormModal
        open={taskFormOpen}
        projectId={projectId}
        task={editing}
        onClose={() => setTaskFormOpen(false)}
        onSaved={() => refetch()}
      />
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="mt-2 font-serif text-[18px] text-ink-primary tabular-nums">{value}</div>
    </div>
  )
}
