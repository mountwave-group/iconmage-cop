#!/usr/bin/env node
// Phase 2 release announcement — Telegram bot, inline feedback keyboard.
// Usage: node send-release-phase2.js
import https from 'node:https'
import 'dotenv/config'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID
const URL = process.env.DASHBOARD_URL || 'https://icop.mountwavegroup.com/'

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env')
  process.exit(1)
}

const text = [
  '*ICON IMAGE · Phase 2*',
  '_A quiet evening unveiling_',
  '',
  'Varvara,',
  '',
  'The house has grown three new rooms tonight.',
  '',
  '*Clients* — a private registry, kept the way you keep a guest book in Monaco. Every name, every channel, every quiet history. Nothing on display that should not be.',
  '',
  '*Projects* — a seven-stage roadmap that walks beside the team rather than herding them. Tasks, KPIs, and the calm certainty that no detail is in the wrong drawer.',
  '',
  '*Communications* — WhatsApp, Telegram, LinkedIn, Instagram and email gathered into one editorial inbox. AI prepares the first sentence; the approval chain decides whether the world ever reads it.',
  '',
  'The aesthetic remains itself — bronze hairlines, wide margins, editorial serif, no theatre. A Cartier portal, not a dashboard.',
  '',
  `[Step inside](${URL})`,
  '',
  '_Take it slowly. The platform will wait._',
].join('\n')

const payload = JSON.stringify({
  chat_id: CHAT_ID,
  text,
  parse_mode: 'Markdown',
  disable_web_page_preview: false,
})

const req = https.request(
  {
    method: 'POST',
    hostname: 'api.telegram.org',
    path: `/bot${TOKEN}/sendMessage`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = ''
    res.on('data', (c) => (body += c))
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body)
        if (parsed.ok) {
          console.log(`Phase 2 release sent · message_id ${parsed.result.message_id}`)
          process.exit(0)
        } else {
          console.error('Telegram error:', parsed.description)
          process.exit(1)
        }
      } catch (e) {
        console.error('Parse error:', e.message, body)
        process.exit(1)
      }
    })
  },
)

req.on('error', (e) => {
  console.error('Request error:', e.message)
  process.exit(1)
})

req.write(payload)
req.end()
