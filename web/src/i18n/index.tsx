import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionaries, LOCALES, type Locale } from './dictionaries'

const STORAGE_KEY = 'icop.locale'

function detectInitial(): Locale {
  if (typeof window === 'undefined') return 'EN'
  const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null
  if (saved && LOCALES.includes(saved)) return saved
  const nav = window.navigator.language?.slice(0, 2).toLowerCase()
  if (nav === 'fr') return 'FR'
  if (nav === 'ru') return 'RU'
  return 'EN'
}

type Ctx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<Ctx | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitial())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.setAttribute(
      'lang',
      locale === 'EN' ? 'en' : locale === 'FR' ? 'fr' : 'ru',
    )
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])

  const t = useCallback<Ctx['t']>(
    (key, vars) => {
      const dict = dictionaries[locale]
      let raw = dict[key] ?? dictionaries.EN[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          raw = raw.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return raw
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <LocaleProvider>')
  return ctx
}

export { LOCALES } from './dictionaries'
export type { Locale } from './dictionaries'
