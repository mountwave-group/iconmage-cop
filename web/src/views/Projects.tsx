import { useState, useMemo } from 'react'
import { projects, canViewFinance, currentRole } from '../data'
import type { Project, Task, TaskStatus } from '../data'
import { serviceWordmarks } from '../brand'
import { useI18n } from '../i18n'

const STATUS_TONE: Record<TaskStatus, string> = {
  COMPLETE: 'text-ink-secondary',
  'IN PROGRESS': 'text-bronze',
  PENDING: 'text-ink-muted',
  BLOCKED: 'text-bronze-deep',
}

export function ProjectsView({ focusClient }: { focusClient?: string | null }) {
  const { t } = useI18n()
  const filtered = useMemo(
    () => (focusClient ? projects.filter((p) => p.client === focusClient) : projects),
    [focusClient],
  )

  const initial = filtered[0]?.id ?? projects[0].id
  const [selectedId, setSelectedId] = useState<string>(initial)
  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? projects[0]

  const count = filtered.length.toString().padStart(2, '0')

  return (
    <>
      <section className="band band-1">
        <div className="eyebrow">
          {focusClient
            ? t('projects.eyebrowForClient', { client: focusClient.toUpperCase(), count })
            : t('projects.eyebrow', { count })}
        </div>
        <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
          {t('projects.title')}
        </h1>
      </section>

      <div className="mt-10 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 band band-2">
        <div className="lg:col-span-4">
          <ul className="panel">
            {filtered.map((p, i) => {
              const isActive = p.id === selected.id
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
                  <div className="font-serif text-[18px] text-ink-primary">{p.client}</div>
                  <div className="eyebrow mt-1 tracking-label">{p.service}</div>
                  <div className="mt-4 h-px bg-white/10 relative">
                    <div
                      className="absolute left-0 top-0 h-px bg-bronze"
                      style={{ width: `${p.progress * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between eyebrow">
                    <span>{t('field.stage')} {p.stage}</span>
                    <span>{t(`status.${p.status}`)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="lg:col-span-8">
          <ProjectDetail project={selected} />
        </div>
      </div>
    </>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  const { t } = useI18n()
  const totalStages = parseInt(project.stage.split('/')[1].trim(), 10)
  const currentStage = parseInt(project.stage.split('/')[0].trim(), 10)
  const wordmark = serviceWordmarks[project.category]

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
      <div className="flex items-start justify-between gap-4 relative">
        <div className="min-w-0">
          <div className="eyebrow truncate">{project.service}</div>
          <h2 className="mt-3 font-serif text-[24px] md:text-[32px] text-ink-primary">{project.client}</h2>
        </div>
        <span className={project.status === 'ON HOLD' ? 'pill-muted shrink-0' : 'pill shrink-0'}>
          {t(`status.${project.status}`)}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <Meta label={t('field.stage')} value={project.stage} />
        <Meta label={t('field.due')} value={project.due} />
        <Meta label={t('field.pmShort')} value={project.pm} />
        {canViewFinance(currentRole) && (
          <Meta label={t('field.budget')} value={`${project.currency} ${project.budget}`} />
        )}
      </div>

      {/* Stage timeline */}
      <div className="mt-12">
        <div className="eyebrow mb-4">{t('projects.roadmap')}</div>
        <div className="flex gap-1">
          {Array.from({ length: totalStages }).map((_, idx) => {
            const stageNum = idx + 1
            const isDone = stageNum < currentStage
            const isNow = stageNum === currentStage
            return (
              <div
                key={idx}
                className={`flex-1 h-1 ${
                  isDone
                    ? 'bg-bronze'
                    : isNow
                      ? 'bg-bronze/60'
                      : 'bg-white/10'
                }`}
              />
            )
          })}
        </div>
        <div className="mt-3 flex justify-between eyebrow">
          <span>{t('projects.stage.first')}</span>
          <span>{t('projects.stage.last', { n: totalStages.toString().padStart(2, '0') })}</span>
        </div>
      </div>

      {/* Task list */}
      <div className="mt-12 pt-8 border-t border-bronze-line">
        <div className="eyebrow mb-6">{t('projects.tasks')}</div>
        <ul>
          {project.tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} />
          ))}
        </ul>
      </div>
    </section>
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

function TaskRow({ task, index }: { task: Task; index: number }) {
  const { t } = useI18n()
  return (
    <li
      className={`grid grid-cols-12 gap-3 md:gap-4 items-baseline py-4 ${
        index > 0 ? 'border-t border-white/8' : ''
      }`}
    >
      <div className="col-span-2 md:col-span-1 eyebrow tabular-nums">
        {(index + 1).toString().padStart(2, '0')}
      </div>
      <div className="col-span-10 md:col-span-5 font-serif text-[14px] md:text-[15px] text-ink-primary">{task.title}</div>
      <div className="col-start-3 col-span-4 md:col-start-auto md:col-span-2 eyebrow tracking-label truncate">{task.assignee}</div>
      <div className="col-span-3 md:col-span-2 eyebrow tabular-nums">{task.due}</div>
      <div
        className={`col-span-3 md:col-span-2 text-right text-[10px] md:text-[11px] uppercase tracking-eyebrow ${STATUS_TONE[task.status]}`}
      >
        {t(`task.${task.status}`)}
      </div>
    </li>
  )
}
