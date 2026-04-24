import { useState } from 'react'
import { Masthead } from './components/Masthead'
import { Sidebar } from './components/Sidebar'
import { Footer } from './components/Footer'
import { OverviewView } from './views/Overview'
import { ClientsView } from './views/Clients'
import { ProjectsView } from './views/Projects'
import { CommunicationsView } from './views/Communications'
import type { ViewId } from './types'

export default function App() {
  const [view, setView] = useState<ViewId>('overview')
  const [focusClient, setFocusClient] = useState<string | null>(null)

  const navigate = (next: ViewId) => {
    if (next !== 'projects') setFocusClient(null)
    setView(next)
  }

  const openProjectsForClient = (name: string) => {
    setFocusClient(name)
    setView('projects')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Masthead active={view} onSelect={navigate} />
      <div className="flex flex-1">
        <Sidebar active={view} onSelect={navigate} />
        <main key={view} className="flex-1 px-24 py-16">
          {view === 'overview' && <OverviewView onNavigate={navigate} />}
          {view === 'clients' && <ClientsView onOpenProjects={openProjectsForClient} />}
          {view === 'projects' && <ProjectsView focusClient={focusClient} />}
          {view === 'comms' && <CommunicationsView />}
          {view === 'finance' && <Placeholder title="Finance" note="Private ledger — available to Owner &amp; PM-Lead." />}
          {view === 'archive' && <Placeholder title="Archive" note="Completed engagements, preserved in full." />}
        </main>
      </div>
      <Footer />
    </div>
  )
}

function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <section className="band band-1">
      <div className="eyebrow">COMING SOON</div>
      <h1 className="mt-4 font-serif font-normal text-[44px] leading-[1.1] tracking-[-0.01em] text-ink-primary">
        {title}.
      </h1>
      <p
        className="mt-6 text-[14px] leading-[1.8] text-ink-secondary max-w-xl"
        dangerouslySetInnerHTML={{ __html: note }}
      />
    </section>
  )
}
