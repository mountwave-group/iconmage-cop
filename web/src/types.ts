export type ViewId = 'overview' | 'clients' | 'projects' | 'comms' | 'finance' | 'archive'

export const VIEW_LABELS: Record<ViewId, string> = {
  overview: 'Overview',
  clients: 'Clients',
  projects: 'Projects',
  comms: 'Communications',
  finance: 'Finance',
  archive: 'Archive',
}
