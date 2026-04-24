#!/usr/bin/env node
// ICON IMAGE Feedback Form — Telegram announcement
// Usage: node send-feedback-form.js
import https from 'node:https'
import 'dotenv/config'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env')
  process.exit(1)
}

const text = [
  '*📋 ICON IMAGE CRM Dashboard — Phase 1 Feedback*',
  '_Varvara, your input shapes the platform._',
  '',
  '*The form covers:*',
  '',
  '🎨 *Visual Aesthetics*',
  '• Layout & spacing (96px gutter, breathing room)',
  '• Color & accent (#C9A48A bronze, #0F0F0F dark)',
  '• Typography (Cormorant Garamond + Inter Light)',
  '',
  '✨ *Interaction & Motion*',
  '• Hover states & transitions',
  '• Page entry animations',
  '• Overall feel & responsiveness',
  '',
  '🔍 *Functionality & Clarity*',
  '• Content hierarchy (KPI cells, engagements focal point)',
  '• Information density (no clutter)',
  '• Engagement cards & status pills',
  '• Signal column (W/T/L/I)',
  '• Ledger preview (multi-currency)',
  '',
  '📝 *Overall Impression*',
  '• What feels right',
  '• What feels off',
  '• One feature to prioritize',
  '',
  '[Live Dashboard](https://d1kgmyudtbgvxp.cloudfront.net/#)',
  '[Feedback Form](https://github.com/mountwave-group/iconmage-cop/blob/main/FEEDBACK_FORM.md)',
  '',
  '_Reply here with your feedback or complete the form._',
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
          console.log(`✓ Feedback form sent · message_id ${parsed.result.message_id}`)
          process.exit(0)
        } else {
          console.error('✗ Telegram error:', parsed.description)
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
