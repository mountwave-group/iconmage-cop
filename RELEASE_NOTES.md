# ICON IMAGE CRM Dashboard — Phase 1 Release

**Status:** Ready for deployment  
**Date:** April 24, 2026  
**Environment:** AWS Amplify (eu-west-2)  
**Recipient:** Varvara Frolova, Founder

---

## Quick Start

### 1. Deploy to Production

```bash
cd /Users/umutyalcinkaya/projects/iconmage-cop/web

# Verify build
npm run build

# Deploy to Amplify
amplify publish
```

The dashboard will be live at: `https://icopweb-dev.amplifyapp.com`

---

### 2. Send Telegram Release Announcement

#### Setup
Create a `.env` file in the project root with:

```bash
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_CHAT_ID=<varvara_chat_id>
DASHBOARD_URL=https://icopweb-dev.amplifyapp.com
```

**Where to get these:**
- **Bot Token:** Create a bot via [@BotFather](https://t.me/botfather) on Telegram
- **Chat ID:** Message your bot, then use [@userinfobot](https://t.me/userinfobot) to get your ID

#### Send the Message

```bash
cd /Users/umutyalcinkaya/projects/iconmage-cop
node send-release.js
```

Expected output:
```
📤 Sending Phase 1 release announcement to Telegram...
✅ Release message sent to Telegram
   Message ID: 12345
```

---

### 3. Collect Feedback

Two methods:

#### Method A: Structured Form (Recommended)
1. Share [FEEDBACK_FORM.md](FEEDBACK_FORM.md) with Varvara
2. Ask her to reply with completed sections
3. Store responses in `feedback/phase-1/<date>.md`

#### Method B: Freeform Reply
1. Ask for initial reactions via Telegram
2. Follow up with specific questions if needed
3. Document in shared folder

---

## What's Included in Phase 1

### Visual Composition
- **Masthead** (80px): Wordmark, serif nav, monogram, keyboard hint
- **Sidebar** (240px): Permanent nav, active state indicator, Settings
- **Main Content**:
  - Greeting band with timezone-aware message
  - Pulse strip with 4 KPIs
  - Active Engagements feature (4 sample cards)
  - Right rail: Signal column + Ledger preview
- **Footer** (80px): Wordmark footer, language toggle

### Design Tokens
- **Colors**: Dark canvas (#0F0F0F–#1A1A1A), bronze accent (#C9A48A)
- **Typography**: Cormorant Garamond (serif), Inter (sans)
- **Motion**: 200ms ease-luxe, 180ms card sweep, 320ms entrance fade
- **Spacing**: 96px outer gutter, 32px column gap, 2px radius

### Interactive Features
- Card hover: top-edge bronze sweep + glow lift
- Nav links: 0.5px bronze underline on hover
- Sidebar: active indicator with left bar
- Status pills: outlined style (never filled)
- Progress rails: 0.5px hairline with bronze fill to %

### Data
- 4 sample engagements (Maison Arielle, Orient Pearl Holdings, Château de Valmont, House of Lumière)
- 4 inbound signals (WhatsApp, Telegram, LinkedIn, Instagram)
- 3 ledger entries (multi-currency preview)
- KPI metrics (Active Engagements, Pending Approvals, Inbound Signals 24h, Portfolio Value)

---

## File Structure

```
/Users/umutyalcinkaya/projects/iconmage-cop/
├── web/                              # Frontend (Vite + React + TS)
│   ├── src/
│   │   ├── App.tsx                  # Dashboard layout
│   │   ├── components/
│   │   │   ├── Masthead.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PulseStrip.tsx
│   │   │   ├── Engagements.tsx
│   │   │   ├── RightRail.tsx        # Signals + Ledger
│   │   │   └── Footer.tsx
│   │   ├── data.ts                  # Mock data
│   │   ├── index.css                # Global styles + Tailwind
│   │   └── main.tsx
│   ├── tailwind.config.js           # Luxury token definitions
│   ├── vite.config.ts
│   ├── package.json
│   ├── amplify/                     # AWS Amplify backend
│   │   ├── backend/
│   │   ├── .config/
│   │   └── team-provider-info.json
│   └── dist/                        # Production build (generated)
├── send-release.js                  # Telegram bot announcement script
├── .env.example                     # Environment template
├── FEEDBACK_FORM.md                 # Structured feedback collection
├── AGENTS.md                        # Agent operating procedures
├── .github/
│   └── copilot-instructions.md      # Design & build guidelines
└── README.md
```

---

## Technical Details

### Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 with custom luxury tokens
- **Fonts**: Cormorant Garamond (serif), Inter (sans) — Google Fonts
- **Backend**: AWS Amplify Gen 1
- **Hosting**: S3 + CloudFront (via Amplify)
- **Region**: eu-west-2 (London)
- **Build**: `npm run build` → `dist/` (391 ms, 10.61 KB CSS gzip, 62.55 KB JS gzip)

### Build Verification
```
✓ 23 modules transformed
dist/index.html                   0.78 kB │ gzip:  0.43 kB
dist/assets/index-BhaUWm7I.css   10.61 kB │ gzip:  3.25 kB
dist/assets/index-IMDX1eAn.js   199.33 kB │ gzip: 62.55 kB
✓ built in 377ms
```

---

## Feedback Collection — Key Questions

Tailor these to Varvara's concerns:

**Visual Register**
- Does the dashboard feel like a Louis Vuitton private portal?
- Is the dark + bronze + serif combination striking the right tone?
- Do the wide margins feel premium or wasteful?

**Usability**
- Can you immediately identify the top 3 metrics?
- Is the engagement card layout clear?
- Does the sidebar feel stable/trustworthy?

**Features**
- What's missing from this view?
- Should we prioritize Client drawer, Project roadmap, or Communications inbox next?
- Do the mock data feel realistic?

**Tone**
- Is the greeting ("Good evening, Varvara.") the right voice?
- Should status pills use different language (IN MOTION vs. ACTIVE)?
- Do the signal lettermarks (W/T/L/I) work better than logos?

---

## Next Phases (Roadmap)

**Phase 2 — Operational Logic**
- Client CRM drawer (contact, projects, history)
- Project roadmap with service-specific tasks
- Communications inbox (unified WhatsApp/Telegram/LinkedIn/Instagram)
- Role-based data filtering

**Phase 3 — Backend Infrastructure**
- NestJS API with JWT auth
- PostgreSQL schema (Client, Project, Task, FinRecord, ActivityLog)
- AWS S3 integration for file versioning
- GPT-4 drafting module with approval chain
- Webhook integrations (WhatsApp, Telegram, LinkedIn)

---

## Support

**Questions?** Reply to the Telegram release message.  
**Issues?** Update [FEEDBACK_FORM.md](FEEDBACK_FORM.md) with your findings.  
**Urgent?** Contact the ICON IMAGE Copilot.

---

*ICON IMAGE Corporate Operating Platform · Phase 1: CRM Dashboard — Live  
Private & Confidential · All rights reserved*
