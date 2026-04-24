#!/usr/bin/env node
// Phase 2 release announcement — Telegram bot, inline feedback keyboard.
// Usage: node send-release-phase2.js
import https from 'node:https'
import 'dotenv/config'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID
const URL = process.env.DASHBOARD_URL || 'https://d1kgmyudtbgvxp.cloudfront.net'

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env')
  process.exit(1)
}

const text = [
  '*ICON IMAGE · Phase 2 Release*',
  '_Operational Logic — Private Preview_',
  '',
  'The dashboard now extends beyond the overview.',
  '',
  '*New chambers*',
  '• *Clients* — private registry, channel map, role-gated lifetime value',
  '• *Projects* — seven-stage roadmap, task status, KPI per deliverable',
  '• *Communications* — unified inbox (W · T · L · I · E), AI-drafted replies under the approval chain',
  '',
  '*Preserved*',
  '• Louis Vuitton / Cartier restraint — editorial typography, bronze hairlines, wide margins',
  '• No SaaS clutter, no emoji in UI, no filled status badges',
  '',
  `[Enter the Platform](${URL})`,
  '',
  '_Review at your convenience and reply below._',
].join('\n')

const payload = JSON.stringify({
  chat_id: CHAT_ID,
  text,
  parse_mode: 'Markdown',
  disable_web_page_preview: false,
  reply_markup: {
    inline_keyboard: [
      [
        { text: '✓ Clients — approved', callback_data: 'p2_clients_ok' },
        { text: '✓ Roadmap — approved', callback_data: 'p2_roadmap_ok' },
      ],
      [
        { text: '✓ Inbox — approved', callback_data: 'p2_inbox_ok' },
        { text: '✎ Request revision', callback_data: 'p2_revise' },
      ],
    ],
  },
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
