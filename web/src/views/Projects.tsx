import { useState, useMemo } from 'react'
import { projects, canViewFinance, currentRole } from '../data'
import type { Project, Task, TaskStatus } from '../data'

const STATUS_TONE: Record<TaskStatus, string> = {
  COMPLETE: 'text-ink-secondary',
  'IN PROGRESS': 'text-bronze',
  PENDING: 'text-ink-muted',
  BLOCKED: 'text-bronze-deep',
}

export function ProjectsView({ focusClient }: { focusClient?: string | null }) {
  const filtered = useMemo(
    () => (focusClient ? projects.filter((p) => p.client === focusClient) : projects),
    [focusClient],
  )

  const initial = filtered[0]?.id ?? projects[0].id
  const [selectedId, setSelectedId] = useState<string>(initial)
  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? projects[0]

  return (
    <>
      <section className="band band-1">
        <div className="eyebrow">
          {focusClient ? `${focusClient.toUpperCase()} · ` : ''}
          PROJECTS · {filtered.length.toString().padStart(2, '0')} ACTIVE
        </div>
        <h1 className="mt-4 font-serif font-normal text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
          Engagement Roadmaps.
        </h1>
      </section>

      <div className="mt-16 grid grid-cols-12 gap-8 band band-2">
        <div className="col-span-4">
          <ul className="panel">
            {filtered.map((p, i) => {
              const isActive = p.id === selected.id
              return (
                <li
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`cursor-pointer px-8 py-6 ${
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
                    <span>STAGE {p.stage}</span>
                    <span>{p.status}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="col-span-8">
          <ProjectDetail project={selected} />
        </div>
      </div>
    </>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  const totalStages = parseInt(project.stage.split('/')[1].trim(), 10)
  const currentStage = parseInt(project.stage.split('/')[0].trim(), 10)

  return (
    <section className="panel px-12 py-10 band band-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow">{project.service}</div>
          <h2 className="mt-3 font-serif text-[32px] text-ink-primary">{project.client}</h2>
        </div>
        <span className={project.status === 'ON HOLD' ? 'pill-muted' : 'pill'}>
          {project.status}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-8">
        <Meta label="STAGE" value={project.stage} />
        <Meta label="DUE" value={project.due} />
        <Meta label="PM" value={project.pm} />
        {canViewFinance(currentRole) && (
          <Meta label="BUDGET" value={`${project.currency} ${project.budget}`} />
        )}
      </div>

      {/* Stage timeline */}
      <div className="mt-12">
        <div className="eyebrow mb-4">ROADMAP</div>
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
          <span>STAGE 01</span>
          <span>STAGE {totalStages.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Task list */}
      <div className="mt-12 pt-8 border-t border-bronze-line">
        <div className="eyebrow mb-6">TASKS</div>
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
  return (
    <li
      className={`grid grid-cols-12 gap-4 items-baseline py-4 ${
        index > 0 ? 'border-t border-white/8' : ''
      }`}
    >
      <div className="col-span-1 eyebrow tabular-nums">
        {(index + 1).toString().padStart(2, '0')}
      </div>
      <div className="col-span-5 font-serif text-[15px] text-ink-primary">{task.title}</div>
      <div className="col-span-2 eyebrow tracking-label">{task.assignee}</div>
      <div className="col-span-2 eyebrow tabular-nums">{task.due}</div>
      <div
        className={`col-span-2 text-right text-[11px] uppercase tracking-eyebrow ${STATUS_TONE[task.status]}`}
      >
        {task.status}
      </div>
    </li>
  )
}
