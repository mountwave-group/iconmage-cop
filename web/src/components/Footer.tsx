export function Footer() {
  const langs = ['EN', 'FR', 'RU']
  const current = 'EN'
  return (
    <footer className="h-20 bg-bg-inset border-t border-bronze-line flex items-center justify-between px-24">
      <div className="eyebrow">
        ICON IMAGE GROUP · MONACO · PRIVATE &amp; CONFIDENTIAL
      </div>
      <div className="flex items-center gap-2">
        {langs.map((l) => (
          <button
            key={l}
            className={`rounded-luxe border px-3 py-1 text-[10px] tracking-eyebrow transition-colors duration-200 ease-luxe ${
              l === current
                ? 'border-bronze text-bronze'
                : 'border-white/15 text-ink-muted hover:text-ink-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </footer>
  )
}
