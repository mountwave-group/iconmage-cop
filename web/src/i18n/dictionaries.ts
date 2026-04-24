// ICON IMAGE — i18n dictionaries (EN · FR · RU)
// Keep keys dotted and grouped. Data values (client names, service taxonomy,
// notes) remain untouched — UI chrome only.

export type Locale = 'EN' | 'FR' | 'RU'

export const LOCALES: Locale[] = ['EN', 'FR', 'RU']

export const LOCALE_LABEL: Record<Locale, string> = {
  EN: 'EN',
  FR: 'FR',
  RU: 'RU',
}

type Dict = Record<string, string>

const en: Dict = {
  // Masthead · Sidebar · Footer
  'brand.name': 'ICON IMAGE',
  'nav.overview': 'Overview',
  'nav.clients': 'Clients',
  'nav.projects': 'Projects',
  'nav.comms': 'Communications',
  'nav.commsShort': 'Comms',
  'nav.finance': 'Finance',
  'nav.archive': 'Archive',
  'nav.settings': 'Settings',
  'footer.confidential': 'ICON IMAGE GROUP · MONACO · PRIVATE & CONFIDENTIAL',

  // Overview
  'overview.dateline': 'FRIDAY · 24 APRIL · MONACO',
  'overview.greeting': 'Good evening, Varvara.',

  // KPIs (Pulse Strip)
  'kpi.activeEngagements': 'ACTIVE ENGAGEMENTS',
  'kpi.pendingApprovals': 'PENDING APPROVALS',
  'kpi.inbound24h': 'INBOUND SIGNALS · 24H',
  'kpi.portfolioValue': 'PORTFOLIO VALUE',
  'kpi.delta.engagements': '↑ 3 vs. last week',
  'kpi.delta.approvals': '2 require owner',
  'kpi.delta.inbound': '↑ 11 vs. yesterday',
  'kpi.delta.portfolio': 'APR — RUNNING',

  // Engagements card
  'engagements.title': 'Active Engagements',
  'engagements.viewAll': 'VIEW ALL —',
  'field.stage': 'STAGE',
  'field.due': 'DUE',
  'field.pm': 'PROJECT MANAGER',
  'field.pmShort': 'PM',
  'field.budget': 'BUDGET',

  // Signals · Ledger
  'signals.title': 'Signals',
  'signals.last24h': 'LAST 24 H —',
  'ledger.title': 'Ledger',
  'ledger.monthApril': 'APRIL',
  'ledger.rangeStart': '01 APR',
  'ledger.rangeEnd': '30 APR',

  // Clients view
  'clients.eyebrow': 'CLIENTS · {count} ON FILE',
  'clients.title': 'Client Registry.',
  'clients.since': 'SINCE {year}',
  'clients.primaryContact': 'PRIMARY CONTACT',
  'clients.sinceLabel': 'SINCE',
  'clients.activeEngagements': 'ACTIVE ENGAGEMENTS',
  'clients.lifetimeValue': 'LIFETIME VALUE',
  'clients.notes': 'NOTES',
  'clients.related': 'RELATED ENGAGEMENTS',
  'clients.openRoadmaps': 'OPEN ROADMAPS —',
  'clients.stageDuePm': 'STAGE {stage} · DUE {due} · PM {pm}',

  // Projects view
  'projects.eyebrow': 'PROJECTS · {count} ACTIVE',
  'projects.eyebrowForClient': '{client} · PROJECTS · {count} ACTIVE',
  'projects.title': 'Engagement Roadmaps.',
  'projects.roadmap': 'ROADMAP',
  'projects.stage.first': 'STAGE 01',
  'projects.stage.last': 'STAGE {n}',
  'projects.tasks': 'TASKS',

  // Communications
  'comms.eyebrow': 'COMMUNICATIONS · UNIFIED INBOX',
  'comms.title': 'Signals & correspondence.',
  'comms.filter.ALL': 'ALL',
  'comms.filter.UNREAD': 'UNREAD',
  'comms.filter.FLAGGED': 'FLAGGED',
  'comms.inbound': 'INBOUND',
  'comms.reply': 'REPLY · AI DRAFT',
  'comms.reply.placeholder':
    'Compose a reply, or invite the AI to draft one — all outbound passes through PM approval.',
  'comms.btn.generate': 'GENERATE DRAFT',
  'comms.btn.sendPm': 'SEND TO PM',
  'comms.chain': 'CHAIN · AI → PERFORMER → PM → OWNER',

  // Placeholders
  'placeholder.finance.title': 'Finance',
  'placeholder.finance.note': 'Private ledger — available to Owner & PM-Lead.',
  'placeholder.archive.title': 'Archive',
  'placeholder.archive.note': 'Completed engagements, preserved in full.',
  'placeholder.eyebrow': 'COMING SOON',

  // Project statuses
  'status.IN MOTION': 'IN MOTION',
  'status.AWAITING APPROVAL': 'AWAITING APPROVAL',
  'status.ON HOLD': 'ON HOLD',
  'status.DELIVERED': 'DELIVERED',

  // Task statuses
  'task.COMPLETE': 'COMPLETE',
  'task.IN PROGRESS': 'IN PROGRESS',
  'task.PENDING': 'PENDING',
  'task.BLOCKED': 'BLOCKED',

  // Tiers
  'tier.PRIVATE': 'PRIVATE',
  'tier.CORPORATE': 'CORPORATE',
  'tier.VIP': 'VIP',
}

const fr: Dict = {
  'brand.name': 'ICON IMAGE',
  'nav.overview': 'Vue d’ensemble',
  'nav.clients': 'Clients',
  'nav.projects': 'Projets',
  'nav.comms': 'Communications',
  'nav.commsShort': 'Comms',
  'nav.finance': 'Finance',
  'nav.archive': 'Archives',
  'nav.settings': 'Paramètres',
  'footer.confidential': 'ICON IMAGE GROUP · MONACO · PRIVÉ & CONFIDENTIEL',

  'overview.dateline': 'VENDREDI · 24 AVRIL · MONACO',
  'overview.greeting': 'Bonsoir, Varvara.',

  'kpi.activeEngagements': 'ENGAGEMENTS ACTIFS',
  'kpi.pendingApprovals': 'APPROBATIONS EN ATTENTE',
  'kpi.inbound24h': 'SIGNAUX ENTRANTS · 24H',
  'kpi.portfolioValue': 'VALEUR DU PORTEFEUILLE',
  'kpi.delta.engagements': '↑ 3 vs semaine dernière',
  'kpi.delta.approvals': '2 requièrent la propriétaire',
  'kpi.delta.inbound': '↑ 11 vs hier',
  'kpi.delta.portfolio': 'AVR — EN COURS',

  'engagements.title': 'Engagements Actifs',
  'engagements.viewAll': 'TOUT VOIR —',
  'field.stage': 'ÉTAPE',
  'field.due': 'ÉCHÉANCE',
  'field.pm': 'CHEF DE PROJET',
  'field.pmShort': 'CP',
  'field.budget': 'BUDGET',

  'signals.title': 'Signaux',
  'signals.last24h': 'DERNIÈRES 24 H —',
  'ledger.title': 'Grand Livre',
  'ledger.monthApril': 'AVRIL',
  'ledger.rangeStart': '01 AVR',
  'ledger.rangeEnd': '30 AVR',

  'clients.eyebrow': 'CLIENTS · {count} AU REGISTRE',
  'clients.title': 'Registre Clients.',
  'clients.since': 'DEPUIS {year}',
  'clients.primaryContact': 'CONTACT PRINCIPAL',
  'clients.sinceLabel': 'DEPUIS',
  'clients.activeEngagements': 'ENGAGEMENTS ACTIFS',
  'clients.lifetimeValue': 'VALEUR À VIE',
  'clients.notes': 'NOTES',
  'clients.related': 'ENGAGEMENTS LIÉS',
  'clients.openRoadmaps': 'OUVRIR LES FEUILLES DE ROUTE —',
  'clients.stageDuePm': 'ÉTAPE {stage} · ÉCHÉANCE {due} · CP {pm}',

  'projects.eyebrow': 'PROJETS · {count} ACTIFS',
  'projects.eyebrowForClient': '{client} · PROJETS · {count} ACTIFS',
  'projects.title': 'Feuilles de Route.',
  'projects.roadmap': 'FEUILLE DE ROUTE',
  'projects.stage.first': 'ÉTAPE 01',
  'projects.stage.last': 'ÉTAPE {n}',
  'projects.tasks': 'TÂCHES',

  'comms.eyebrow': 'COMMUNICATIONS · BOÎTE UNIFIÉE',
  'comms.title': 'Signaux & correspondance.',
  'comms.filter.ALL': 'TOUS',
  'comms.filter.UNREAD': 'NON LUS',
  'comms.filter.FLAGGED': 'SIGNALÉS',
  'comms.inbound': 'ENTRANT',
  'comms.reply': 'RÉPONSE · BROUILLON IA',
  'comms.reply.placeholder':
    'Rédigez une réponse ou invitez l’IA à en proposer une — tout envoi passe par l’approbation du CP.',
  'comms.btn.generate': 'GÉNÉRER LE BROUILLON',
  'comms.btn.sendPm': 'TRANSMETTRE AU CP',
  'comms.chain': 'CHAÎNE · IA → EXÉCUTANT → CP → PROPRIÉTAIRE',

  'placeholder.finance.title': 'Finance',
  'placeholder.finance.note':
    'Grand livre privé — accessible à la Propriétaire et au CP-Lead.',
  'placeholder.archive.title': 'Archives',
  'placeholder.archive.note': 'Engagements clos, préservés dans leur intégralité.',
  'placeholder.eyebrow': 'PROCHAINEMENT',

  'status.IN MOTION': 'EN COURS',
  'status.AWAITING APPROVAL': 'EN ATTENTE D’APPROBATION',
  'status.ON HOLD': 'SUSPENDU',
  'status.DELIVERED': 'LIVRÉ',

  'task.COMPLETE': 'TERMINÉE',
  'task.IN PROGRESS': 'EN COURS',
  'task.PENDING': 'EN ATTENTE',
  'task.BLOCKED': 'BLOQUÉE',

  'tier.PRIVATE': 'PRIVÉ',
  'tier.CORPORATE': 'CORPORATIF',
  'tier.VIP': 'VIP',
}

const ru: Dict = {
  'brand.name': 'ICON IMAGE',
  'nav.overview': 'Обзор',
  'nav.clients': 'Клиенты',
  'nav.projects': 'Проекты',
  'nav.comms': 'Коммуникации',
  'nav.commsShort': 'Связь',
  'nav.finance': 'Финансы',
  'nav.archive': 'Архив',
  'nav.settings': 'Настройки',
  'footer.confidential': 'ICON IMAGE GROUP · МОНАКО · КОНФИДЕНЦИАЛЬНО',

  'overview.dateline': 'ПЯТНИЦА · 24 АПРЕЛЯ · МОНАКО',
  'overview.greeting': 'Добрый вечер, Варвара.',

  'kpi.activeEngagements': 'АКТИВНЫЕ ПРОЕКТЫ',
  'kpi.pendingApprovals': 'ОЖИДАЮТ УТВЕРЖДЕНИЯ',
  'kpi.inbound24h': 'ВХОДЯЩИЕ · 24Ч',
  'kpi.portfolioValue': 'СТОИМОСТЬ ПОРТФЕЛЯ',
  'kpi.delta.engagements': '↑ 3 к прошлой неделе',
  'kpi.delta.approvals': '2 требуют владельца',
  'kpi.delta.inbound': '↑ 11 ко вчерашнему',
  'kpi.delta.portfolio': 'АПР — ТЕКУЩИЙ',

  'engagements.title': 'Активные проекты',
  'engagements.viewAll': 'ВСЕ —',
  'field.stage': 'ЭТАП',
  'field.due': 'СРОК',
  'field.pm': 'МЕНЕДЖЕР ПРОЕКТА',
  'field.pmShort': 'PM',
  'field.budget': 'БЮДЖЕТ',

  'signals.title': 'Сигналы',
  'signals.last24h': 'ЗА 24 Ч —',
  'ledger.title': 'Реестр',
  'ledger.monthApril': 'АПРЕЛЬ',
  'ledger.rangeStart': '01 АПР',
  'ledger.rangeEnd': '30 АПР',

  'clients.eyebrow': 'КЛИЕНТЫ · {count} В РЕЕСТРЕ',
  'clients.title': 'Реестр клиентов.',
  'clients.since': 'С {year}',
  'clients.primaryContact': 'ОСНОВНОЙ КОНТАКТ',
  'clients.sinceLabel': 'С',
  'clients.activeEngagements': 'АКТИВНЫЕ ПРОЕКТЫ',
  'clients.lifetimeValue': 'СОВОКУПНАЯ ЦЕННОСТЬ',
  'clients.notes': 'ЗАМЕТКИ',
  'clients.related': 'СВЯЗАННЫЕ ПРОЕКТЫ',
  'clients.openRoadmaps': 'ОТКРЫТЬ ДОРОЖНЫЕ КАРТЫ —',
  'clients.stageDuePm': 'ЭТАП {stage} · СРОК {due} · PM {pm}',

  'projects.eyebrow': 'ПРОЕКТЫ · {count} АКТИВНЫХ',
  'projects.eyebrowForClient': '{client} · ПРОЕКТЫ · {count} АКТИВНЫХ',
  'projects.title': 'Дорожные карты.',
  'projects.roadmap': 'ДОРОЖНАЯ КАРТА',
  'projects.stage.first': 'ЭТАП 01',
  'projects.stage.last': 'ЭТАП {n}',
  'projects.tasks': 'ЗАДАЧИ',

  'comms.eyebrow': 'КОММУНИКАЦИИ · ЕДИНЫЙ ЯЩИК',
  'comms.title': 'Сигналы и корреспонденция.',
  'comms.filter.ALL': 'ВСЕ',
  'comms.filter.UNREAD': 'НЕПРОЧИТАННЫЕ',
  'comms.filter.FLAGGED': 'ОТМЕЧЕННЫЕ',
  'comms.inbound': 'ВХОДЯЩЕЕ',
  'comms.reply': 'ОТВЕТ · ЧЕРНОВИК ИИ',
  'comms.reply.placeholder':
    'Составьте ответ или поручите ИИ подготовить черновик — все исходящие проходят через утверждение PM.',
  'comms.btn.generate': 'СОЗДАТЬ ЧЕРНОВИК',
  'comms.btn.sendPm': 'ПЕРЕДАТЬ PM',
  'comms.chain': 'ЦЕПОЧКА · ИИ → ИСПОЛНИТЕЛЬ → PM → ВЛАДЕЛЕЦ',

  'placeholder.finance.title': 'Финансы',
  'placeholder.finance.note':
    'Частный реестр — доступен Владельцу и PM-Lead.',
  'placeholder.archive.title': 'Архив',
  'placeholder.archive.note': 'Завершённые проекты, сохранены полностью.',
  'placeholder.eyebrow': 'СКОРО',

  'status.IN MOTION': 'В РАБОТЕ',
  'status.AWAITING APPROVAL': 'ОЖИДАЕТ УТВЕРЖДЕНИЯ',
  'status.ON HOLD': 'ПРИОСТАНОВЛЕН',
  'status.DELIVERED': 'СДАН',

  'task.COMPLETE': 'ВЫПОЛНЕНО',
  'task.IN PROGRESS': 'В РАБОТЕ',
  'task.PENDING': 'ОЖИДАЕТ',
  'task.BLOCKED': 'БЛОКИРОВАНО',

  'tier.PRIVATE': 'ЧАСТНЫЙ',
  'tier.CORPORATE': 'КОРПОРАТИВНЫЙ',
  'tier.VIP': 'VIP',
}

export const dictionaries: Record<Locale, Dict> = { EN: en, FR: fr, RU: ru }
