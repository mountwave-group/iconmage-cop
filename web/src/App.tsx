import { useState } from 'react'
import { Masthead } from './components/Masthead'
import { Sidebar } from './components/Sidebar'
import { Footer } from './components/Footer'
import { MobileTabBar } from './components/MobileTabBar'
import { OverviewView } from './views/Overview'
import { ClientsView } from './views/Clients'
import { ProjectsView } from './views/Projects'
import { CommunicationsView } from './views/Communications'
import { SettingsView } from './views/Settings'
import type { ViewId } from './types'
import { useI18n } from './i18n'
import { useAuth } from './auth/AuthContext'
import { LoginScreen } from './auth/LoginScreen'

export default function App() {
  const { status } = useAuth()
  const [view, setView] = useState<ViewId>('overview')
  const [focusClient, setFocusClient] = useState<string | null>(null)

  const navigate = (next: ViewId) => {
    if (next !== 'projects') setFocusClient(null)
    setView(next)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }

  const openProjectsForClient = (name: string) => {
    setFocusClient(name)
    setView('projects')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg-base">
        <div className="eyebrow text-ink-secondary">Authenticating…</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <LoginScreen />
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Masthead active={view} onSelect={navigate} />
      <div className="flex flex-1">
        <Sidebar active={view} onSelect={navigate} />
        <main
          key={view}
          className="flex-1 min-w-0 px-5 py-8 md:px-24 md:py-16 pb-24 md:pb-16"
        >
          {view === 'overview' && <OverviewView onNavigate={navigate} />}
          {view === 'clients' && <ClientsView onOpenProjects={openProjectsForClient} />}
          {view === 'projects' && <ProjectsView focusClient={focusClient} />}
          {view === 'comms' && <CommunicationsView />}
          {view === 'finance' && <Placeholder titleKey="placeholder.finance.title" noteKey="placeholder.finance.note" />}
          {view === 'archive' && <Placeholder titleKey="placeholder.archive.title" noteKey="placeholder.archive.note" />}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>
      <Footer />
      <MobileTabBar active={view} onSelect={navigate} />
    </div>
  )
}

function Placeholder({ titleKey, noteKey }: { titleKey: string; noteKey: string }) {
  const { t } = useI18n()
  return (
    <section className="band band-1">
      <div className="eyebrow">{t('placeholder.eyebrow')}</div>
      <h1 className="mt-4 font-serif font-normal text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
        {t(titleKey)}.
      </h1>
      <p className="mt-6 text-[14px] leading-[1.8] text-ink-secondary max-w-xl">
        {t(noteKey)}
      </p>
    </section>
  )
}
