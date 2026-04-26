import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'
import { useI18n } from '../i18n'

export function LoginScreen() {
  const { signIn, error } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch {
      // error surfaces via auth context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 py-16 bg-bg-primary">
      <form
        onSubmit={onSubmit}
        className="panel w-full max-w-md px-8 py-10 md:px-12 md:py-12"
        aria-label={t('login.title') ?? 'Sign in'}
      >
        <div className="eyebrow">ICON IMAGE</div>
        <h1 className="mt-3 font-serif font-normal text-[28px] md:text-[32px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
          {t('login.title') ?? 'Private access'}
        </h1>
        <p className="mt-3 text-[13px] leading-[1.7] text-ink-secondary">
          {t('login.subtitle') ?? 'Members only. Sign in with your corporate credentials.'}
        </p>

        <label className="block mt-10">
          <span className="eyebrow">{t('login.email') ?? 'Email'}</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
          />
        </label>

        <label className="block mt-8">
          <span className="eyebrow">{t('login.password') ?? 'Password'}</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
          />
        </label>

        {error && (
          <p className="mt-6 text-[12px] tracking-label text-bronze" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-10 w-full border border-bronze-line text-bronze eyebrow py-4 transition-colors duration-200 ease-luxe hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? (t('login.submitting') ?? 'Signing in…')
            : (t('login.submit') ?? 'Enter')}
        </button>
      </form>
    </div>
  )
}
