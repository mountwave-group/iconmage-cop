import { useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useI18n, LOCALES, type Locale } from '../i18n'
import { useTheme, type ThemeMode } from '../theme/ThemeContext'

type SectionId =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'team'
  | 'billing'
  | 'integrations'

interface NotificationPrefs {
  email: boolean
  inApp: boolean
  digest: boolean
}

const PREFS_KEY = 'iconimage.notify.v1'

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { email: true, inApp: true, digest: false, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { email: true, inApp: true, digest: false }
}

function savePrefs(prefs: NotificationPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

export function SettingsView() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [active, setActive] = useState<SectionId>('profile')

  const sections: { id: SectionId; labelKey: string; visible: boolean }[] = useMemo(
    () => [
      { id: 'profile', labelKey: 'settings.section.profile', visible: true },
      { id: 'security', labelKey: 'settings.section.security', visible: true },
      {
        id: 'notifications',
        labelKey: 'settings.section.notifications',
        visible: true,
      },
      { id: 'appearance', labelKey: 'settings.section.appearance', visible: true },
      {
        id: 'team',
        labelKey: 'settings.section.team',
        visible: user?.role === 'OWNER' || user?.role === 'PM_LEAD',
      },
      {
        id: 'billing',
        labelKey: 'settings.section.billing',
        visible: user?.role === 'OWNER',
      },
      {
        id: 'integrations',
        labelKey: 'settings.section.integrations',
        visible: user?.role === 'OWNER' || user?.role === 'PM_LEAD',
      },
    ],
    [user?.role],
  )

  return (
    <section className="band band-1">
      <div className="eyebrow text-bronze">{t('settings.eyebrow')}</div>
      <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
        {t('settings.title')}
      </h1>
      <p className="mt-4 text-[14px] leading-[1.8] text-ink-secondary max-w-xl">
        {t('settings.subtitle')}
      </p>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <nav aria-label={t('settings.title')} className="flex lg:flex-col gap-1 overflow-x-auto">
          {sections
            .filter((s) => s.visible)
            .map((s) => {
              const isActive = s.id === active
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`relative text-left font-serif text-[15px] py-2 pl-6 pr-4 whitespace-nowrap transition-colors duration-200 ease-luxe ${
                    isActive
                      ? 'text-ink-primary'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-px bg-bronze" />
                  )}
                  {t(s.labelKey)}
                </button>
              )
            })}
        </nav>

        <div className="min-w-0">
          {active === 'profile' && <ProfileSection />}
          {active === 'security' && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'appearance' && <AppearanceSection />}
          {active === 'team' && <PlaceholderSection
            title={t('settings.team.title')}
            note={t('settings.team.note')}
            placeholder={t('settings.team.placeholder')}
          />}
          {active === 'billing' && <PlaceholderSection
            title={t('settings.billing.title')}
            note={t('settings.billing.note')}
            placeholder={t('settings.billing.placeholder')}
          />}
          {active === 'integrations' && <IntegrationsSection />}
        </div>
      </div>
    </section>
  )
}

// ── Profile ─────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { t, locale, setLocale } = useI18n()
  const { user } = useAuth()
  const [name, setName] = useState(user?.fullName ?? '')
  const [saved, setSaved] = useState(false)

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '·'

  return (
    <SectionShell title={t('settings.profile.title')} note={t('settings.profile.note')}>
      <div className="mt-8 flex items-center gap-6">
        <div className="h-24 w-24 rounded-full border border-bronze flex items-center justify-center font-serif text-[28px] text-bronze">
          {initials}
        </div>
        <div>
          <div className="eyebrow">{t('settings.profile.avatar')}</div>
          <p className="mt-2 text-[12px] leading-[1.7] text-ink-secondary max-w-xs">
            {t('settings.profile.avatarHint')}
          </p>
        </div>
      </div>

      <Field label={t('login.name')}>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved(false)
          }}
          className="w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
        />
      </Field>

      <Field label={t('login.email')}>
        <input
          type="email"
          value={user?.email ?? ''}
          readOnly
          className="w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-muted outline-none cursor-not-allowed"
        />
      </Field>

      <Field label={t('settings.profile.role')}>
        <div className="py-3 font-serif text-[15px] text-ink-secondary">
          {user ? t(`login.role.${user.role}`) : '—'}
        </div>
      </Field>

      <Field label={t('settings.profile.locale')}>
        <div className="flex gap-2">
          {LOCALES.map((l: Locale) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`px-4 py-2 border eyebrow transition-colors duration-200 ease-luxe ${
                locale === l
                  ? 'border-bronze text-bronze'
                  : 'border-bronze-line/40 text-ink-secondary hover:text-bronze hover:border-bronze-line'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSaved(true)}
          disabled={!name.trim() || name === user?.fullName}
          className="px-6 py-3 border border-bronze-line text-bronze eyebrow transition-colors duration-200 ease-luxe hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('settings.profile.save')}
        </button>
        {saved && (
          <span className="eyebrow text-bronze">{t('settings.profile.saved')}</span>
        )}
      </div>
    </SectionShell>
  )
}

// ── Security ────────────────────────────────────────────────────────────────

function SecuritySection() {
  const { t } = useI18n()
  const { signOut } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const matches = next.length >= 12 && next === confirm
  const canSubmit = current.length > 0 && matches

  return (
    <SectionShell title={t('settings.security.title')} note={t('settings.security.note')}>
      <Field label={t('settings.security.current')}>
        <input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
        />
      </Field>
      <Field label={t('settings.security.new')}>
        <input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
        />
      </Field>
      <Field label={t('settings.security.confirm')}>
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-transparent border-b border-bronze-line py-3 font-serif text-[16px] text-ink-primary outline-none focus:border-bronze transition-colors duration-200"
        />
      </Field>

      <p className="mt-6 text-[12px] tracking-label text-ink-muted">
        {t('settings.security.unavailable')}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={!canSubmit}
          className="px-6 py-3 border border-bronze-line text-bronze eyebrow transition-colors duration-200 ease-luxe hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('settings.security.change')}
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="px-6 py-3 border border-bronze-line/40 text-ink-secondary eyebrow transition-colors duration-200 ease-luxe hover:text-bronze hover:border-bronze-line"
        >
          {t('settings.security.signOutEverywhere')}
        </button>
      </div>
    </SectionShell>
  )
}

// ── Notifications ───────────────────────────────────────────────────────────

function NotificationsSection() {
  const { t } = useI18n()
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadPrefs())

  const update = (patch: Partial<NotificationPrefs>) => {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    savePrefs(next)
  }

  return (
    <SectionShell
      title={t('settings.notifications.title')}
      note={t('settings.notifications.note')}
    >
      <div className="mt-8 flex flex-col">
        <Toggle
          label={t('settings.notifications.email')}
          checked={prefs.email}
          onChange={(v) => update({ email: v })}
        />
        <Toggle
          label={t('settings.notifications.inApp')}
          checked={prefs.inApp}
          onChange={(v) => update({ inApp: v })}
        />
        <Toggle
          label={t('settings.notifications.digest')}
          checked={prefs.digest}
          onChange={(v) => update({ digest: v })}
        />
      </div>
    </SectionShell>
  )
}

// ── Appearance ──────────────────────────────────────────────────────────────

function AppearanceSection() {
  const { t } = useI18n()
  const { mode, resolved, setMode } = useTheme()
  const options: { id: ThemeMode; labelKey: string }[] = [
    { id: 'system', labelKey: 'theme.system' },
    { id: 'dark', labelKey: 'theme.dark' },
    { id: 'light', labelKey: 'theme.light' },
  ]

  return (
    <SectionShell
      title={t('settings.appearance.title')}
      note={t('settings.appearance.note')}
    >
      <div className="mt-8">
        <div className="eyebrow">{t('theme.current')}</div>
        <div className="mt-3 inline-flex border border-bronze-line">
          {options.map((opt) => {
            const isActive = mode === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id)}
                className={`relative px-6 py-3 eyebrow transition-colors duration-200 ease-luxe ${
                  isActive ? 'text-bronze' : 'text-ink-secondary hover:text-bronze'
                }`}
                aria-pressed={isActive}
              >
                {t(opt.labelKey)}
                {isActive && (
                  <span className="absolute left-3 right-3 -bottom-px h-px bg-bronze" />
                )}
              </button>
            )
          })}
        </div>
        <p className="mt-4 eyebrow text-ink-muted">
          {mode === 'system' ? `${t('theme.system')} · ${t(`theme.${resolved}`)}` : t(`theme.${resolved}`)}
        </p>
      </div>
    </SectionShell>
  )
}

// ── Integrations ────────────────────────────────────────────────────────────

function IntegrationsSection() {
  const { t } = useI18n()
  const integrations: { name: string; status: 'connected' | 'pending' }[] = [
    { name: 'WhatsApp Business', status: 'pending' },
    { name: 'Telegram', status: 'pending' },
    { name: 'LinkedIn', status: 'pending' },
    { name: 'Instagram', status: 'pending' },
    { name: 'AWS S3', status: 'connected' },
  ]
  return (
    <SectionShell
      title={t('settings.integrations.title')}
      note={t('settings.integrations.note')}
    >
      <ul className="mt-8 flex flex-col">
        {integrations.map((i) => (
          <li
            key={i.name}
            className="flex items-center justify-between py-4 border-b border-bronze-line/30"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i.status === 'connected' ? 'bg-bronze' : 'bg-bronze-line'
                }`}
              />
              <span className="font-serif text-[15px] text-ink-primary">{i.name}</span>
            </div>
            <button
              type="button"
              disabled
              className="eyebrow text-ink-muted opacity-50 cursor-not-allowed"
              title={t('settings.integrations.comingSoon')}
            >
              {t('settings.integrations.configure')} —
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 eyebrow text-ink-muted">
        {t('settings.integrations.comingSoon')}
      </p>
    </SectionShell>
  )
}

// ── Generic placeholder ─────────────────────────────────────────────────────

function PlaceholderSection({
  title,
  note,
  placeholder,
}: {
  title: string
  note: string
  placeholder: string
}) {
  return (
    <SectionShell title={title} note={note}>
      <div className="mt-10 px-6 py-8 border border-bronze-line/40 text-[13px] tracking-label text-ink-secondary">
        {placeholder}
      </div>
    </SectionShell>
  )
}

// ── Primitives ──────────────────────────────────────────────────────────────

function SectionShell({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: ReactNode
}) {
  return (
    <div>
      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
        {title}
      </h2>
      <p className="mt-2 text-[13px] leading-[1.7] text-ink-secondary max-w-xl">
        {note}
      </p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mt-8">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between py-4 border-b border-bronze-line/30 text-left group"
    >
      <span className="font-serif text-[15px] text-ink-primary group-hover:text-bronze transition-colors duration-200">
        {label}
      </span>
      <span
        className={`relative h-4 w-8 border transition-colors duration-200 ease-luxe ${
          checked ? 'border-bronze bg-bronze/20' : 'border-bronze-line/60 bg-transparent'
        }`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 transition-all duration-200 ease-luxe ${
            checked ? 'right-[3px] bg-bronze' : 'left-[3px] bg-ink-muted'
          }`}
        />
      </span>
    </button>
  )
}
