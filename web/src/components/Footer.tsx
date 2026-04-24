import { useI18n } from '../i18n'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="bg-bg-inset border-t border-bronze-line px-5 md:px-24 py-6 md:py-0 md:h-20 flex items-center justify-center md:justify-start">
      <div className="eyebrow text-center md:text-left">
        {t('footer.confidential')}
      </div>
    </footer>
  )
}
