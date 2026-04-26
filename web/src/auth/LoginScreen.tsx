import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'
import { useI18n } from '../i18n'
import { LocaleSwitcher } from '../components/LocaleSwitcher'
import { brand } from '../brand'

type SeedRole = 'OWNER' | 'PM_LEAD' | 'PM' | 'PERFORMER'

const SEEDS: Record<SeedRole, { email: string; password: string }> = {
  OWNER: { email: 'varvara@iconimage.group', password: 'Owner!Passw0rd' },
  PM_LEAD: { email: 'aubry@iconimage.group', password: 'PmLead!Passw0rd' },
  PM: { email: 'nakamura@iconimage.group', password: 'Pm!Passw0rd' },
  PERFORMER: { email: 'devos@iconimage.group', password: 'Performer!Passw0rd' },
}

const SHOW_SEEDS = import.meta.env.DEV

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
      /* surfaced via auth context */
    } finally {
      setSubmitting(false)
    }
  }

  const fillSeed = (role: SeedRole) => {
    setEmail(SEEDS[role].email)
    setPassword(SEEDS[role].password)
  }

  return (
    <div className="min-h-[100dvh] bg-bg-base flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 md:py-8">
        <div className="flex items-center gap-3 text-ink-primary">
          <img
            src={brand.serpent}
            alt=""
            className="h-6 w-6 opacity-90"
            draggable={false}
          />
          <span className="font-serif text-[15px] tracking-wordmark">
            {t('brand.name')}
          </span>
        </div>
        <LocaleSwitcher />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <form
            onSubmit={onSubmit}
            className="panel px-8 py-10 md:px-12 md:py-12"
            aria-label={t('login.title')}
            noValidate
          >
            <div className="eyebrow text-bronze">{t('login.eyebrow')}</div>
            <h1 className="mt-3 font-serif font-normal text-[28px] md:text-[32px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
              {t('login.title')}
            </h1>
            <p className="mt-3 text-[13px] leading-[1.7] text-ink-secondary">
              {t('login.subtitle')}
            </p>

            <label className="block mt-10">
              <span className="eyebrow">{t('login.email')}</span>
              <input
                type="email"
                autoComplete="username"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
              />
            </label>

            <label className="block mt-8">
              <span className="eyebrow">{t('login.password')}</span>
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
              <div
                role="alert"
                className="mt-6 px-4 py-3 border border-bronze-line/60 text-[12px] tracking-label text-bronze"
              >
                {t('login.error.generic')}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="mt-10 w-full border border-bronze-line text-bronze eyebrow py-4 transition-colors duration-200 ease-luxe hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? t('login.submitting') : t('login.submit')}
            </button>
          </form>

          {SHOW_SEEDS && (
            <section className="mt-8 px-2" aria-label={t('login.demoTitle')}>
              <div className="eyebrow text-ink-secondary">
                {t('login.demoTitle')}
              </div>
              <p className="mt-2 text-[12px] leading-[1.7] text-ink-secondary/80">
                {t('login.demoHint')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(Object.keys(SEEDS) as SeedRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillSeed(role)}
                    className="px-3 py-2 border border-bronze-line/40 eyebrow text-ink-secondary hover:text-bronze hover:border-bronze-line transition-colors duration-200 ease-luxe text-left"
                  >
                    {t(`login.role.${role}`)}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="px-6 md:px-12 py-6 eyebrow text-ink-secondary/70">
        {t('footer.confidential')}
      </footer>
    </div>
  )
}
