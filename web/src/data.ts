export type ServiceCategory =
  | 'CONSULTING'
  | 'DIGITAL'
  | 'BRANDING'
  | 'CONTENT'
  | 'PR'
  | 'VIP'

export type ProjectStatus =
  | 'IN MOTION'
  | 'AWAITING APPROVAL'
  | 'ON HOLD'
  | 'DELIVERED'

export type TaskStatus = 'COMPLETE' | 'IN PROGRESS' | 'PENDING' | 'BLOCKED'

export type Role = 'OWNER' | 'PM_LEAD' | 'PM' | 'PERFORMER' | 'CLIENT'

export type ChannelSource = 'W' | 'T' | 'L' | 'I' | 'E'

export interface Task {
  id: string
  title: string
  assignee: string
  status: TaskStatus
  due: string
  kpi?: string
}

export interface Project {
  id: string
  client: string
  service: string
  category: ServiceCategory
  status: ProjectStatus
  stage: string
  due: string
  pm: string
  progress: number
  budget: string
  currency: string
  tasks: Task[]
}

export interface Client {
  id: string
  name: string
  country: string
  tier: 'PRIVATE' | 'CORPORATE' | 'VIP'
  since: string
  primaryContact: string
  contactTitle: string
  channels: ChannelSource[]
  activeProjects: number
  lifetimeValue: string
  currency: string
  notes: string
}

export interface Signal {
  id: string
  source: ChannelSource
  sourceLabel: string
  sender: string
  subject: string
  preview: string
  time: string
  unread: boolean
  client?: string
}

export const clients: Client[] = [
  {
    id: 'cl-001',
    name: 'Maison Arielle',
    country: 'FRANCE',
    tier: 'PRIVATE',
    since: '2024',
    primaryContact: 'Arielle Laurent',
    contactTitle: 'FOUNDER',
    channels: ['W', 'E'],
    activeProjects: 2,
    lifetimeValue: '182,000',
    currency: '€',
    notes:
      'Founder-led haute perfumerie. Prefers morning calls. Brand voice: intimate, slow, pre-war European.',
  },
  {
    id: 'cl-002',
    name: 'Orient Pearl Holdings',
    country: 'SINGAPORE',
    tier: 'CORPORATE',
    since: '2023',
    primaryContact: 'H. Tan',
    contactTitle: 'GROUP MARKETING DIRECTOR',
    channels: ['T', 'L', 'E'],
    activeProjects: 3,
    lifetimeValue: '418,500',
    currency: '$',
    notes:
      'Family office with luxury hospitality portfolio. Reports to board quarterly. Requires EN + simplified CN deliverables.',
  },
  {
    id: 'cl-003',
    name: 'Château de Valmont',
    country: 'SWITZERLAND',
    tier: 'PRIVATE',
    since: '2025',
    primaryContact: 'Baron N. de Valmont',
    contactTitle: 'PROPRIETOR',
    channels: ['W', 'E'],
    activeProjects: 1,
    lifetimeValue: '96,800',
    currency: '€',
    notes:
      'Vineyard & wellness estate. Minimal digital footprint by design. Prefers print & in-person.',
  },
  {
    id: 'cl-004',
    name: 'House of Lumière',
    country: 'MONACO',
    tier: 'VIP',
    since: '2022',
    primaryContact: 'Sofia Lumière',
    contactTitle: 'CREATIVE DIRECTOR',
    channels: ['I', 'W', 'T'],
    activeProjects: 1,
    lifetimeValue: '1,240,000',
    currency: '€',
    notes:
      'Flagship haute couture house. Direct line to founder. All approvals require Varvara sign-off.',
  },
  {
    id: 'cl-005',
    name: 'Riviera Private Office',
    country: 'MONACO',
    tier: 'VIP',
    since: '2026',
    primaryContact: 'Chairman (discreet)',
    contactTitle: 'PRINCIPAL',
    channels: ['E'],
    activeProjects: 0,
    lifetimeValue: '—',
    currency: '€',
    notes:
      'New inbound via L. Aubry referral. Awaiting initial brief. Confidentiality class: PLATINUM.',
  },
]

export const projects: Project[] = [
  {
    id: 'pr-001',
    client: 'Maison Arielle',
    service: 'BRANDING · CORPORATE IDENTITY',
    category: 'BRANDING',
    status: 'IN MOTION',
    stage: '03 / 07',
    due: '12 MAY',
    pm: 'L. AUBRY',
    progress: 0.42,
    budget: '48,000',
    currency: '€',
    tasks: [
      { id: 't1', title: 'Brand audit & competitive benchmark', assignee: 'STRATEGY', status: 'COMPLETE', due: '02 APR', kpi: 'Delivered' },
      { id: 't2', title: 'Typography system exploration', assignee: 'DESIGN', status: 'COMPLETE', due: '10 APR', kpi: '3 routes' },
      { id: 't3', title: 'Primary wordmark — first round', assignee: 'DESIGN', status: 'IN PROGRESS', due: '24 APR', kpi: '2 concepts' },
      { id: 't4', title: 'Color system & material palette', assignee: 'DESIGN', status: 'IN PROGRESS', due: '02 MAY', kpi: '—' },
      { id: 't5', title: 'Brand book — draft v1', assignee: 'DESIGN', status: 'PENDING', due: '08 MAY', kpi: '—' },
      { id: 't6', title: 'Client review & revision cycle', assignee: 'PM', status: 'PENDING', due: '10 MAY', kpi: '—' },
      { id: 't7', title: 'Final delivery & handover', assignee: 'PM', status: 'PENDING', due: '12 MAY', kpi: 'Signed' },
    ],
  },
  {
    id: 'pr-002',
    client: 'Orient Pearl Holdings',
    service: 'PR · MEDIA RELATIONS',
    category: 'PR',
    status: 'AWAITING APPROVAL',
    stage: '05 / 08',
    due: '02 MAY',
    pm: 'H. NAKAMURA',
    progress: 0.63,
    budget: '72,500',
    currency: '$',
    tasks: [
      { id: 't1', title: 'Media landscape mapping — APAC', assignee: 'PR', status: 'COMPLETE', due: '15 MAR', kpi: '28 outlets' },
      { id: 't2', title: 'Narrative framework draft', assignee: 'STRATEGY', status: 'COMPLETE', due: '25 MAR', kpi: 'Approved' },
      { id: 't3', title: 'Press kit assembly', assignee: 'DESIGN', status: 'COMPLETE', due: '05 APR', kpi: 'Delivered' },
      { id: 't4', title: 'Tier-1 outlet outreach', assignee: 'PR', status: 'COMPLETE', due: '15 APR', kpi: '12 conv.' },
      { id: 't5', title: 'Interview scheduling & prep', assignee: 'PR', status: 'IN PROGRESS', due: '22 APR', kpi: '5 booked' },
      { id: 't6', title: 'Chairman briefing pack', assignee: 'STRATEGY', status: 'BLOCKED', due: '25 APR', kpi: 'Awaiting approval' },
      { id: 't7', title: 'Event launch coordination', assignee: 'PM', status: 'PENDING', due: '28 APR', kpi: '—' },
      { id: 't8', title: 'Post-launch report', assignee: 'PM', status: 'PENDING', due: '02 MAY', kpi: '—' },
    ],
  },
  {
    id: 'pr-003',
    client: 'Château de Valmont',
    service: 'DIGITAL · SEO · SMM',
    category: 'DIGITAL',
    status: 'IN MOTION',
    stage: '02 / 06',
    due: '28 MAY',
    pm: 'V. FROLOVA',
    progress: 0.28,
    budget: '26,800',
    currency: '€',
    tasks: [
      { id: 't1', title: 'Technical SEO audit', assignee: 'DIGITAL', status: 'COMPLETE', due: '05 APR', kpi: 'Score 82' },
      { id: 't2', title: 'Keyword strategy — EU luxury wellness', assignee: 'DIGITAL', status: 'IN PROGRESS', due: '24 APR', kpi: '—' },
      { id: 't3', title: 'Content calendar — Q2', assignee: 'CONTENT', status: 'PENDING', due: '01 MAY', kpi: '—' },
      { id: 't4', title: 'SMM channel setup', assignee: 'DIGITAL', status: 'PENDING', due: '08 MAY', kpi: '—' },
      { id: 't5', title: 'Launch & monitoring', assignee: 'PM', status: 'PENDING', due: '22 MAY', kpi: '—' },
      { id: 't6', title: 'Month 1 performance review', assignee: 'PM', status: 'PENDING', due: '28 MAY', kpi: '—' },
    ],
  },
  {
    id: 'pr-004',
    client: 'House of Lumière',
    service: 'CONTENT · VIDEO · COPY',
    category: 'CONTENT',
    status: 'ON HOLD',
    stage: '01 / 05',
    due: '—',
    pm: 'C. DE VOS',
    progress: 0.18,
    budget: '185,000',
    currency: '€',
    tasks: [
      { id: 't1', title: 'Creative brief — FW26 campaign', assignee: 'STRATEGY', status: 'COMPLETE', due: '10 APR', kpi: 'Approved' },
      { id: 't2', title: 'Pre-production & casting', assignee: 'PRODUCTION', status: 'BLOCKED', due: '—', kpi: 'Awaiting client' },
      { id: 't3', title: 'Shoot — Paris atelier', assignee: 'PRODUCTION', status: 'PENDING', due: '—', kpi: '—' },
      { id: 't4', title: 'Post-production & copy', assignee: 'CONTENT', status: 'PENDING', due: '—', kpi: '—' },
      { id: 't5', title: 'Campaign rollout', assignee: 'PM', status: 'PENDING', due: '—', kpi: '—' },
    ],
  },
]

export const signalThreads: Signal[] = [
  {
    id: 's-001',
    source: 'W',
    sourceLabel: 'WHATSAPP',
    sender: 'Arielle Laurent',
    subject: 'Contract addendum — Maison Arielle',
    preview:
      "Varvara, j'ai ajouté les clauses de confidentialité. Peux-tu relire avant vendredi ? Merci infiniment.",
    time: '14 M',
    unread: true,
    client: 'Maison Arielle',
  },
  {
    id: 's-002',
    source: 'T',
    sourceLabel: 'TELEGRAM',
    sender: 'H. Tan',
    subject: 'Moodboard approved — Orient Pearl',
    preview:
      'Chairman has signed off on route 2. Please proceed with press kit assembly and schedule the APAC briefing.',
    time: '42 M',
    unread: true,
    client: 'Orient Pearl Holdings',
  },
  {
    id: 's-003',
    source: 'L',
    sourceLabel: 'LINKEDIN',
    sender: 'L. Aubry',
    subject: 'Intro: Riviera Group Chairman',
    preview:
      "Introducing you to the Chairman of Riviera Private Office. Discretion required. He'll reach out Monday.",
    time: '2 H',
    unread: false,
    client: 'Riviera Private Office',
  },
  {
    id: 's-004',
    source: 'I',
    sourceLabel: 'INSTAGRAM',
    sender: 'Sofia Lumière',
    subject: 'Press clipping — Château de Valmont',
    preview:
      'Vogue Business featured our Valmont campaign in their weekly. Sharing the spread for the record.',
    time: '6 H',
    unread: false,
    client: 'House of Lumière',
  },
  {
    id: 's-005',
    source: 'E',
    sourceLabel: 'EMAIL',
    sender: 'Invoicing · Orient Pearl',
    subject: 'Milestone 02 — payment confirmation',
    preview:
      'Wire transfer of $72,500 received. Remittance advice attached. Allocated to project pr-002.',
    time: '1 D',
    unread: false,
    client: 'Orient Pearl Holdings',
  },
  {
    id: 's-006',
    source: 'W',
    sourceLabel: 'WHATSAPP',
    sender: 'Baron N. de Valmont',
    subject: 'Print proofs — Valmont estate',
    preview:
      'Les épreuves sont arrivées. Qualité excellente sur le papier Arches. Je les fais livrer au bureau.',
    time: '1 D',
    unread: false,
    client: 'Château de Valmont',
  },
]

// Back-compat export for Phase 1 components.
export const signals = signalThreads.slice(0, 4).map((s) => ({
  source: s.source,
  subject: s.subject,
  time: s.time,
}))

export const ledger = [
  { glyph: '€', party: 'Maison Arielle · Retainer', amount: '48,000' },
  { glyph: '$', party: 'Orient Pearl · Milestone 02', amount: '72,500' },
  { glyph: '€', party: 'Château de Valmont · Scope A', amount: '26,800' },
] as const

export const kpis = [
  { label: 'ACTIVE ENGAGEMENTS', value: '17', delta: '↑ 3 vs. last week' },
  { label: 'PENDING APPROVALS', value: '04', delta: '2 require owner' },
  { label: 'INBOUND SIGNALS · 24H', value: '29', delta: '↑ 11 vs. yesterday' },
  { label: 'PORTFOLIO VALUE', value: '€ 4.2M', delta: 'APR — RUNNING' },
] as const

// Engagements used by Phase 1 Engagements component.
export const engagements = projects.map((p) => ({
  client: p.client,
  service: p.service,
  status: p.status,
  stage: p.stage,
  due: p.due,
  pm: p.pm,
  progress: p.progress,
}))

// --- Role helpers ---
export const currentRole: Role = 'OWNER'

export function canViewFinance(role: Role): boolean {
  return role === 'OWNER' || role === 'PM_LEAD'
}
