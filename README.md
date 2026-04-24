# ICON IMAGE — Corporate Operating Platform

Private digital headquarters for ICON IMAGE Group. Monaco HQ with offices in London, New York, Singapore, Dubai.

---

## Phase 1: CRM Dashboard — Now Live

A luxury-first dashboard for executive visibility into active engagements, signals, and financial metrics.

### 🚀 Release the Dashboard

```bash
./release.sh
```

This automates:
1. **Build** — Vite production build
2. **Deploy** — AWS Amplify publishing
3. **Announce** — Telegram release message to Varvara
4. **Summary** — Output deployment details & next steps

**Prerequisites:**
- `.env` file with `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
- AWS credentials (profile: `amplify-uk`)
- Node.js + npm + Amplify CLI

### 📋 Setup Instructions

#### 1. Create `.env`
```bash
cp .env.example .env
```

#### 2. Get Telegram Credentials

**Bot Token:**
- Message [@BotFather](https://t.me/botfather) on Telegram
- Create a new bot (name: "ICON IMAGE Release Bot")
- Copy the API Token

**Chat ID (Varvara):**
- Message your bot
- Forward the message to [@userinfobot](https://t.me/userinfobot)
- Copy your Chat ID

#### 3. Update `.env`
```bash
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
DASHBOARD_URL=https://icopweb-dev.amplifyapp.com
```

#### 4. Release
```bash
./release.sh
```

---

## 📁 Project Structure

```
.
├── web/                          # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── App.tsx              # Main dashboard
│   │   ├── components/          # UI components (6 total)
│   │   ├── data.ts              # Mock data
│   │   └── index.css            # Global styles + Tailwind
│   ├── tailwind.config.js       # Luxury design tokens
│   ├── amplify/                 # AWS Amplify config
│   ├── package.json
│   └── dist/                    # Production build
├── release.sh                   # Automated release script
├── send-release.js              # Telegram bot announcement
├── RELEASE_NOTES.md             # Full deployment guide
├── FEEDBACK_FORM.md             # Structured feedback collection
├── .env.example                 # Environment template
└── README.md                    # This file
```

---

## 🎨 Design Language

**Visual Register:** Louis Vuitton private portal aesthetic  
**Canvas:** Dark (#0F0F0F–#1A1A1A) with bronze accents (#C9A48A)  
**Typography:** Cormorant Garamond (serif) + Inter (sans)  
**Motion:** 200ms ease-luxe, 180ms card sweeps, no bounce  
**Layout:** 96px outer gutter, 32px column gap, 2px radius

---

## 📊 Dashboard Features

### Landing Surface
- **Masthead** — Wordmark, serif nav, monogram
- **Sidebar** — Permanent navigation with active indicator
- **Greeting** — Timezone-aware message
- **Pulse Strip** — 4 KPI cells (Engagements, Approvals, Signals, Portfolio Value)
- **Engagements** — Active projects with progress, stage, due date, PM
- **Signals** — Inbound communications (WhatsApp, Telegram, LinkedIn, Instagram)
- **Ledger** — Multi-currency financial preview with month-pace line

### Interactive Elements
- Card hover: bronze top-edge sweep + glow lift (180ms)
- Nav links: bronze underline on hover (200ms)
- Sidebar: active state with left accent bar
- Status pills: outlined style (IN MOTION, AWAITING APPROVAL, ON HOLD)
- Progress rails: 0.5px hairline with bronze fill

---

## 📱 Collect Feedback

### Method 1: Structured Form (Recommended)
1. Share [FEEDBACK_FORM.md](FEEDBACK_FORM.md)
2. Ask Varvara to complete sections
3. Store response in `feedback/phase-1/<date>.md`

### Method 2: Freeform Telegram
1. Initial reactions come via Telegram reply
2. Follow up with specific questions
3. Document in shared folder

**Key Questions:**
- Does the dashboard feel luxe? (visual register check)
- What's the one feature to prioritize next?
- Any UI elements that feel off or confusing?

---

## 🔗 Links

- **Dashboard:** https://icopweb-dev.amplifyapp.com
- **Release Notes:** [RELEASE_NOTES.md](RELEASE_NOTES.md)
- **Feedback Form:** [FEEDBACK_FORM.md](FEEDBACK_FORM.md)
- **Release Script:** [release.sh](release.sh)
- **Environment Template:** [.env.example](.env.example)

---

## 📦 Stack

- **Frontend:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v3 with custom tokens
- **Fonts:** Cormorant Garamond (Google), Inter (Google)
- **Backend:** AWS Amplify Gen 1
- **Hosting:** S3 + CloudFront
- **Region:** eu-west-2 (London)

---

## 🎯 What's Next

**Phase 2 — Operational Logic**
- Client CRM drawer
- Project roadmap with task management
- Communications inbox (unified messaging)
- Role-based data filtering

**Phase 3 — Backend Infrastructure**
- NestJS API with JWT auth
- PostgreSQL schema
- AWS S3 integration
- GPT-4 content drafting module
- Webhook integrations

---

## 📞 Support

**Questions or issues?**
- Update [FEEDBACK_FORM.md](FEEDBACK_FORM.md) with findings
- Reply to the Telegram release message
- Contact the ICON IMAGE Copilot

---

*ICON IMAGE Corporate Operating Platform · Phase 1: CRM Dashboard  
Private & Confidential · All rights reserved.*
