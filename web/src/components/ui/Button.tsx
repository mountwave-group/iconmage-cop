import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  children: ReactNode
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export function Button({ variant = 'primary', loading, disabled, children, className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${VARIANT_CLASS[variant]} touch-target inline-flex items-center justify-center gap-2 ${className}`}
      {...rest}
    >
      {loading && (
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-60 animate-pulse" aria-hidden />
      )}
      {children}
    </button>
  )
}
