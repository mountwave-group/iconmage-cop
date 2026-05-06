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
  projectsApi,
  type ClientResource,
  type CreateProjectInput,
  type ProjectResource,
  type ProjectStatus,
  type ServiceCategory,
} from '../../api/resources'
import { ApiError } from '../../api/client'

const SERVICE_CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'BRANDING', label: 'Branding' },
  { value: 'CONTENT', label: 'Content & Production' },
  { value: 'PR', label: 'PR & Events' },
  { value: 'VIP', label: 'VIP / Special projects' },
]
const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'IN_MOTION', label: 'In motion' },
  { value: 'AWAITING_APPROVAL', label: 'Awaiting approval' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'DELIVERED', label: 'Delivered' },
]
const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'SGD', 'HKD'].map((c) => ({
  value: c,
  label: c,
}))

interface FormState {
  clientId: string
  serviceCategory: ServiceCategory
  serviceName: string
  status: ProjectStatus
  stageCurrent: string
  stageTotal: string
  dueAt: string
  budget: string
  currency: string
}

const EMPTY: FormState = {
  clientId: '',
  serviceCategory: 'BRANDING',
  serviceName: '',
  status: 'IN_MOTION',
  stageCurrent: '1',
  stageTotal: '8',
  dueAt: '',
  budget: '',
  currency: 'EUR',
}

interface Props {
  open: boolean
  project?: ProjectResource | null
  clients: ClientResource[]
  defaultClientId?: string | null
  canSetBudget: boolean
  onClose: () => void
  onSaved: (p: ProjectResource) => void
}

export function ProjectFormModal({
  open,
  project,
  clients,
  defaultClientId,
  canSetBudget,
  onClose,
  onSaved,
}: Props) {
  const toast = useToast()
  const editing = Boolean(project)
  const [state, setState] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (project) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on open
      setState({
        clientId: project.clientId,
        serviceCategory: project.serviceCategory as ServiceCategory,
        serviceName: project.serviceName,
        status: project.status as ProjectStatus,
        stageCurrent: String(project.stageCurrent),
        stageTotal: String(project.stageTotal),
        dueAt: project.dueAt ? project.dueAt.slice(0, 10) : '',
        budget: project.budgetCents ? String(Number(project.budgetCents) / 100) : '',
        currency: project.currency,
      })
    } else {
      setState({ ...EMPTY, clientId: defaultClientId ?? '' })
    }
    setErrors({})
  }, [open, project, defaultClientId])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!state.clientId) next.clientId = 'Choose a client.'
    if (state.serviceName.trim().length < 2) next.serviceName = 'Required.'
    const sc = parseInt(state.stageCurrent, 10)
    const st = parseInt(state.stageTotal, 10)
    if (!Number.isFinite(sc) || sc < 1) next.stageCurrent = 'Min 1.'
    if (!Number.isFinite(st) || st < 1) next.stageTotal = 'Min 1.'
    if (Number.isFinite(sc) && Number.isFinite(st) && sc > st) next.stageCurrent = 'Cannot exceed total.'
    if (state.budget && (!/^\d+(\.\d{1,2})?$/.test(state.budget) || Number(state.budget) < 0)) {
      next.budget = 'Use a positive amount.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: CreateProjectInput = {
        clientId: state.clientId,
        serviceCategory: state.serviceCategory,
        serviceName: state.serviceName.trim(),
        status: state.status,
        stageCurrent: parseInt(state.stageCurrent, 10),
        stageTotal: parseInt(state.stageTotal, 10),
        currency: state.currency.toUpperCase(),
      }
      // Only include dueAt if a date is selected (avoid sending null)
      if (state.dueAt) {
        payload.dueAt = new Date(state.dueAt).toISOString()
      }
      if (canSetBudget) {
        payload.budgetCents = state.budget ? Math.round(Number(state.budget) * 100) : null
      }
      const saved = project
        ? await projectsApi.update(project.id, payload)
        : await projectsApi.create(payload)
      toast.success(editing ? 'Project updated.' : 'Project created.', saved.serviceName)
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error('Could not save project.', err instanceof ApiError ? err.message : 'Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={editing ? 'EDIT PROJECT' : 'NEW PROJECT'}
      title={editing ? state.serviceName || 'Edit project' : 'Create a project'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" loading={submitting} onClick={onSubmit}>
            {editing ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Field label="Client" required error={errors.clientId}>
            <Select
              value={state.clientId}
              invalid={!!errors.clientId}
              onChange={(e) => set('clientId', e.target.value)}
              placeholder="Select a client…"
              options={clients.map((c) => ({ value: c.id, label: `${c.name} · ${c.country}` }))}
            />
          </Field>
        </div>
        <Field label="Service category" required>
          <Select
            value={state.serviceCategory}
            onChange={(e) => set('serviceCategory', e.target.value as ServiceCategory)}
            options={SERVICE_CATEGORY_OPTIONS}
          />
        </Field>
        <Field label="Status" required>
          <Select
            value={state.status}
            onChange={(e) => set('status', e.target.value as ProjectStatus)}
            options={STATUS_OPTIONS}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Service name" required error={errors.serviceName}>
            <TextInput
              data-autofocus
              value={state.serviceName}
              invalid={!!errors.serviceName}
              onChange={(e) => set('serviceName', e.target.value)}
              placeholder="Maison Marigny — Brand Refresh"
            />
          </Field>
        </div>
        <Field label="Stage current" required error={errors.stageCurrent}>
          <TextInput
            inputMode="numeric"
            value={state.stageCurrent}
            invalid={!!errors.stageCurrent}
            onChange={(e) => set('stageCurrent', e.target.value.replace(/\D/g, ''))}
          />
        </Field>
        <Field label="Stage total" required error={errors.stageTotal}>
          <TextInput
            inputMode="numeric"
            value={state.stageTotal}
            invalid={!!errors.stageTotal}
            onChange={(e) => set('stageTotal', e.target.value.replace(/\D/g, ''))}
          />
        </Field>
        <Field label="Due date">
          <TextInput
            type="date"
            value={state.dueAt}
            onChange={(e) => set('dueAt', e.target.value)}
          />
        </Field>
        <Field label="Currency" required>
          <Select
            value={state.currency}
            onChange={(e) => set('currency', e.target.value)}
            options={CURRENCY_OPTIONS}
          />
        </Field>
        {canSetBudget && (
          <div className="sm:col-span-2">
            <Field
              label="Budget"
              error={errors.budget}
              hint="Visible to OWNER and PM_LEAD only."
            >
              <TextInput
                inputMode="decimal"
                value={state.budget}
                invalid={!!errors.budget}
                onChange={(e) => set('budget', e.target.value)}
                placeholder="120000"
              />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  )
}
