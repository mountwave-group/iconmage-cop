import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

interface FieldShellProps {
  label: string
  htmlFor?: string
  error?: string | null
  hint?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="eyebrow text-ink-secondary">
        {label}{required && <span className="text-bronze ml-1">*</span>}
      </label>
      {children}
      {error && <div className="text-[12px] tracking-[0.04em] text-status-critical">{error}</div>}
      {!error && hint && <div className="text-[12px] tracking-[0.04em] text-ink-muted">{hint}</div>}
    </div>
  )
}

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  invalid?: boolean
}
export function TextInput({ invalid, ...rest }: TextInputProps) {
  return <input className="field" aria-invalid={invalid || undefined} {...rest} />
}

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  invalid?: boolean
}
export function Textarea({ invalid, rows = 4, ...rest }: TextareaProps) {
  return <textarea className="field" rows={rows} aria-invalid={invalid || undefined} {...rest} />
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  invalid?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}
export function Select({ invalid, options, placeholder, ...rest }: SelectProps) {
  return (
    <select className="field" aria-invalid={invalid || undefined} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
