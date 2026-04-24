#!/usr/bin/env node

/**
 * ICON IMAGE CRM Dashboard — Phase 1 Release
 * Telegram Bot Announcement
 * 
 * Usage:
 *   TELEGRAM_BOT_TOKEN=<token> TELEGRAM_CHAT_ID=<id> node send-release.js
 * 
 * OR with .env:
 *   node send-release.js
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://icopweb-dev.amplifyapp.com';

if (!TOKEN || !CHAT_ID) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  console.error('Set these via environment or .env file');
  process.exit(1);
}

const message = `
🏛️ *ICON IMAGE — Corporate Operating Platform*

**Phase 1: CRM Dashboard — Live**

A private digital headquarters for ICON IMAGE Group. Dark, editorial, luxury-first.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *The Dashboard*
• Executive overview with KPI pulse strip
• Active engagements at a glance
• Signal column for inbound communications
• Ledger preview (multi-currency)
• Role-based access control
• Sidebar navigation
• Timezone-aware greeting

🎨 *Design Language*
• Bronze & champagne accents (#C9A48A)
• Dark canvas (#0F0F0F–#1A1A1A)
• Editorial serif headlines (Cormorant Garamond)
• Wide margins, thin lines, no noise
• Smooth 200ms transitions
• Zero emoji, zero bloat

🔐 *Security-First*
• JWT + OAuth2 auth layer
• Role-based guards (Owner → PM-Lead → PM → Performer)
• Immutable audit trail
• GDPR-compliant multi-jurisdiction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👁️ *View the Dashboard*
${DASHBOARD_URL}

📋 *Feedback Form*
We'd love your thoughts on the layout, navigation, and visual register.

Please reply with:
✓ What feels right about the design
✗ What feels off or confusing
💡 One feature you'd prioritize next

Founder: Varvara Frolova
Built: ICON IMAGE Copilot · Monaco · Private & Confidential
`.trim();

function sendTelegram() {
  const postData = JSON.stringify({
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown',
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Release message sent to Telegram');
        const parsed = JSON.parse(data);
        console.log(`   Message ID: ${parsed.result.message_id}`);
        process.exit(0);
      } else {
        console.error(`❌ Telegram API error: ${res.statusCode}`);
        console.error(data);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

console.log('📤 Sending Phase 1 release announcement to Telegram...');
sendTelegram();
