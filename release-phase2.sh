#!/bin/bash
##############################################################################
# ICON IMAGE CRM — Phase 2 Release Script
# Builds · deploys to Amplify · posts Phase 2 Telegram announcement
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
WEB_DIR="$PROJECT_ROOT/web"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

log_header() { echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${BLUE}$1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }

# ── Step 1: env ─────────────────────────────────────────────────────────────
log_header "Step 1 · Environment"
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  log_error ".env missing — copy from .env.example"
  exit 1
fi
export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
: "${TELEGRAM_BOT_TOKEN:?TELEGRAM_BOT_TOKEN not set}"
: "${TELEGRAM_CHAT_ID:?TELEGRAM_CHAT_ID not set}"
log_success "Environment verified"

# ── Step 2: build ───────────────────────────────────────────────────────────
log_header "Step 2 · Build"
cd "$WEB_DIR"
npm run build
[ -d "$WEB_DIR/dist" ] || { log_error "dist/ missing"; exit 1; }
log_success "Built · $(du -sh "$WEB_DIR/dist" | cut -f1)"

# ── Step 3: deploy ──────────────────────────────────────────────────────────
log_header "Step 3 · Amplify Deploy"
amplify publish --yes
log_success "Deployed"

# ── Step 4: announce ────────────────────────────────────────────────────────
log_header "Step 4 · Telegram Phase 2 Announcement"
cd "$PROJECT_ROOT"
node "$PROJECT_ROOT/send-release-phase2.js"
log_success "Announcement sent"

# ── Step 5: summary ─────────────────────────────────────────────────────────
log_header "Phase 2 Release Complete"
echo ""
echo "Modules shipped:"
echo "  · Clients registry with role-gated drawer"
echo "  · Projects roadmap with 7-stage timeline and task list"
echo "  · Communications unified inbox (W · T · L · I · E)"
echo ""
echo "Awaiting feedback via Telegram inline keyboard."
echo ""
exit 0
