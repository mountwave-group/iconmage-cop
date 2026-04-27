import { useEffect, useState } from 'react'
import {
  Modal,
  Button,
  Field,
  TextInput,
  Select,
  useToast,
} from '../../components/ui'
import {
  tasksApi,
  type CreateTaskInput,
  type Role,
  type TaskResource,
  type TaskStatus,
} from '../../api/resources'
import { ApiError } from '../../api/client'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'PM_LEAD', label: 'PM Lead' },
  { value: 'PM', label: 'Project Manager' },
  { value: 'PERFORMER', label: 'Performer' },
  { value: 'CLIENT', label: 'Client' },
]
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'COMPLETE', label: 'Complete' },
]

interface FormState {
  title: string
  assigneeRole: Role
  status: TaskStatus
  dueAt: string
  kpi: string
}

const EMPTY: FormState = {
  title: '',
  assigneeRole: 'PERFORMER',
  status: 'PENDING',
  dueAt: '',
  kpi: '',
}

interface Props {
  open: boolean
  projectId: string
  task?: TaskResource | null
  onClose: () => void
  onSaved: (task: TaskResource) => void
}

export function TaskFormModal({ open, projectId, task, onClose, onSaved }: Props) {
  const toast = useToast()
  const editing = Boolean(task)
  const [state, setState] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on open
      setState({
        title: task.title,
        assigneeRole: task.assigneeRole,
        status: task.status,
        dueAt: task.dueAt ? task.dueAt.slice(0, 10) : '',
        kpi: task.kpi != null ? String(task.kpi) : '',
      })
    } else setState(EMPTY)
    setErrors({})
  }, [open, task])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (state.title.trim().length < 2) next.title = 'Required.'
    if (state.kpi) {
      const k = Number(state.kpi)
      if (!Number.isFinite(k) || k < 0 || k > 120) next.kpi = '0–120.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: CreateTaskInput = {
        title: state.title.trim(),
        assigneeRole: state.assigneeRole,
        status: state.status,
        dueAt: state.dueAt ? new Date(state.dueAt).toISOString() : null,
        kpi: state.kpi ? Number(state.kpi) : null,
      }
      const saved = task
        ? await tasksApi.update(projectId, task.id, payload)
        : await tasksApi.create(projectId, payload)
      toast.success(editing ? 'Task updated.' : 'Task created.', saved.title)
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error('Could not save task.', err instanceof ApiError ? err.message : 'Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={editing ? 'EDIT TASK' : 'NEW TASK'}
      title={editing ? state.title || 'Edit task' : 'Add a task'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" loading={submitting} onClick={onSubmit}>
            {editing ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Field label="Title" required error={errors.title}>
            <TextInput
              data-autofocus
              value={state.title}
              invalid={!!errors.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Concept presentation — round 2"
            />
          </Field>
        </div>
        <Field label="Assignee role" required>
          <Select
            value={state.assigneeRole}
            onChange={(e) => set('assigneeRole', e.target.value as Role)}
            options={ROLE_OPTIONS}
          />
        </Field>
        <Field label="Status" required>
          <Select
            value={state.status}
            onChange={(e) => set('status', e.target.value as TaskStatus)}
            options={STATUS_OPTIONS}
          />
        </Field>
        <Field label="Due date">
          <TextInput
            type="date"
            value={state.dueAt}
            onChange={(e) => set('dueAt', e.target.value)}
          />
        </Field>
        <Field label="KPI (0–120)" error={errors.kpi}>
          <TextInput
            inputMode="numeric"
            value={state.kpi}
            invalid={!!errors.kpi}
            onChange={(e) => set('kpi', e.target.value.replace(/[^\d]/g, ''))}
            placeholder="—"
          />
        </Field>
      </div>
    </Modal>
  )
}
