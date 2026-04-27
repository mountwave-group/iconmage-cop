import { useEffect, useState } from 'react'
import {
  Modal,
  Button,
  Field,
  TextInput,
  Textarea,
  Select,
  useToast,
} from '../../components/ui'
import {
  clientsApi,
  type ClientResource,
  type ClientStatus,
  type ClientTier,
  type CreateClientInput,
} from '../../api/resources'
import { ApiError } from '../../api/client'

const TIER_OPTIONS: { value: ClientTier; label: string }[] = [
  { value: 'PRIVATE', label: 'Private' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'VIP', label: 'VIP' },
]
const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DORMANT', label: 'Dormant' },
  { value: 'ARCHIVED', label: 'Archived' },
]
const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'SGD', 'HKD'].map((c) => ({
  value: c,
  label: c,
}))

interface FormState {
  name: string
  country: string
  tier: ClientTier
  status: ClientStatus
  primaryContact: string
  contactTitle: string
  currency: string
  notes: string
}

const EMPTY: FormState = {
  name: '',
  country: '',
  tier: 'PRIVATE',
  status: 'LEAD',
  primaryContact: '',
  contactTitle: '',
  currency: 'EUR',
  notes: '',
}

interface Props {
  open: boolean
  client?: ClientResource | null
  canSeeNotes: boolean
  onClose: () => void
  onSaved: (client: ClientResource) => void
}

export function ClientFormModal({ open, client, canSeeNotes, onClose, onSaved }: Props) {
  const toast = useToast()
  const editing = Boolean(client)
  const [state, setState] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (client) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on open
      setState({
        name: client.name,
        country: client.country,
        tier: client.tier,
        status: client.status,
        primaryContact: client.primaryContact,
        contactTitle: client.contactTitle ?? '',
        currency: client.currency,
        notes: client.notes ?? '',
      })
    } else {
      setState(EMPTY)
    }
    setErrors({})
  }, [open, client])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (state.name.trim().length < 2) next.name = 'Required (min 2 characters).'
    if (state.country.trim().length < 2) next.country = 'Required.'
    if (state.primaryContact.trim().length < 2) next.primaryContact = 'Required.'
    if (state.currency.trim().length !== 3) next.currency = 'Use a 3-letter ISO code.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: CreateClientInput = {
        name: state.name.trim(),
        country: state.country.trim(),
        tier: state.tier,
        status: state.status,
        primaryContact: state.primaryContact.trim(),
        contactTitle: state.contactTitle.trim() || undefined,
        currency: state.currency.trim().toUpperCase(),
        notes: state.notes.trim() || undefined,
      }
      const saved = client
        ? await clientsApi.update(client.id, payload)
        : await clientsApi.create(payload)
      toast.success(editing ? 'Client updated.' : 'Client created.', saved.name)
      onSaved(saved)
      onClose()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Save failed.'
      toast.error('Could not save client.', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={editing ? 'EDIT CLIENT' : 'NEW CLIENT'}
      title={editing ? state.name || 'Edit client' : 'Add a new client'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" loading={submitting} onClick={onSubmit}>
            {editing ? 'Save changes' : 'Create client'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Field label="Name" required error={errors.name}>
            <TextInput
              data-autofocus
              value={state.name}
              invalid={!!errors.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Maison Marigny"
            />
          </Field>
        </div>
        <Field label="Country" required error={errors.country}>
          <TextInput
            value={state.country}
            invalid={!!errors.country}
            onChange={(e) => set('country', e.target.value)}
            placeholder="Monaco"
          />
        </Field>
        <Field label="Currency" required error={errors.currency}>
          <Select
            value={state.currency}
            onChange={(e) => set('currency', e.target.value)}
            options={CURRENCY_OPTIONS}
            invalid={!!errors.currency}
          />
        </Field>
        <Field label="Tier" required>
          <Select
            value={state.tier}
            onChange={(e) => set('tier', e.target.value as ClientTier)}
            options={TIER_OPTIONS}
          />
        </Field>
        <Field label="Status" required>
          <Select
            value={state.status}
            onChange={(e) => set('status', e.target.value as ClientStatus)}
            options={STATUS_OPTIONS}
          />
        </Field>
        <Field label="Primary contact" required error={errors.primaryContact}>
          <TextInput
            value={state.primaryContact}
            invalid={!!errors.primaryContact}
            onChange={(e) => set('primaryContact', e.target.value)}
            placeholder="Astrid Marigny"
          />
        </Field>
        <Field label="Contact title">
          <TextInput
            value={state.contactTitle}
            onChange={(e) => set('contactTitle', e.target.value)}
            placeholder="Director of Brand"
          />
        </Field>
        {canSeeNotes && (
          <div className="sm:col-span-2">
            <Field label="Internal notes" hint="Visible to OWNER and PM_LEAD only.">
              <Textarea
                value={state.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={4}
                placeholder="Discreet context, preferences, sensitivities…"
              />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  )
}
