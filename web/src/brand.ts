import type { ServiceCategory } from './data'

import serpentUrl from './assets/svg/serpent.svg'
import wordmarkUrl from './assets/svg/wordmark.svg'
import lockupUrl from './assets/svg/lockup.svg'

import brandingUrl from './assets/svg/Branding.svg'
import consultingUrl from './assets/svg/consulting.svg'
import digitalUrl from './assets/svg/Digital.svg'
import designUrl from './assets/svg/Design.svg'
import contentUrl from './assets/svg/content.svg'
import prUrl from './assets/svg/PR.svg'
import totalUrl from './assets/svg/Total.svg'
import oneServiceUrl from './assets/svg/one-service.svg'
import comboServicesUrl from './assets/svg/combo-services.svg'

export const brand = {
  serpent: serpentUrl,
  wordmark: wordmarkUrl,
  lockup: lockupUrl,
}

export const serviceWordmarks: Record<ServiceCategory, string> = {
  BRANDING: brandingUrl,
  CONSULTING: consultingUrl,
  DIGITAL: digitalUrl,
  CONTENT: contentUrl,
  PR: prUrl,
  VIP: totalUrl,
}

export const atelierWordmarks = {
  design: designUrl,
  total: totalUrl,
  oneService: oneServiceUrl,
  comboServices: comboServicesUrl,
}
