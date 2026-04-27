#!/bin/bash
##############################################################################
# ICON IMAGE CRM — Phase 2 Release Script
# Builds · deploys to Amplify · posts Phase 2 Telegram announcement
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Resolve project root: if script lives in <root>/scripts, climb one level.
if [ "$(basename "$SCRIPT_DIR")" = "scripts" ]; then
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  PROJECT_ROOT="$SCRIPT_DIR"
fi
WEB_DIR="$PROJECT_ROOT/web"

# CI=1 (set automatically by GitHub Actions) skips interactive amplify env
# checkout and reads Telegram creds from the environment instead of .env.
CI_MODE="${CI:-0}"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

log_header() { echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${BLUE}$1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }

# ── Step 1: env ─────────────────────────────────────────────────────────────
log_header "Step 1 · Environment"
SKIP_ANNOUNCE="${SKIP_ANNOUNCE:-0}"
if [ "$CI_MODE" = "1" ] || [ "$CI_MODE" = "true" ]; then
  log_info "CI mode — reading Telegram creds from environment"
else
  if [ ! -f "$PROJECT_ROOT/.env" ]; then
    log_error ".env missing — copy from .env.example"
    exit 1
  fi
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_ROOT/.env"
  set +a
fi
if [ "$SKIP_ANNOUNCE" != "1" ]; then
  : "${TELEGRAM_BOT_TOKEN:?TELEGRAM_BOT_TOKEN not set (or set SKIP_ANNOUNCE=1)}"
  : "${TELEGRAM_CHAT_ID:?TELEGRAM_CHAT_ID not set (or set SKIP_ANNOUNCE=1)}"
fi
log_success "Environment verified"

# ── Step 2: build ───────────────────────────────────────────────────────────
log_header "Step 2 · Build"
cd "$WEB_DIR"
npm run build
[ -d "$WEB_DIR/dist" ] || { log_error "dist/ missing"; exit 1; }
log_success "Built · $(du -sh "$WEB_DIR/dist" | cut -f1)"

# ── Step 3: deploy ──────────────────────────────────────────────────────────
log_header "Step 3 · Amplify Deploy"
cd "$WEB_DIR"

if ! command -v amplify >/dev/null 2>&1; then
  log_error "Amplify CLI not found. Install: npm i -g @aws-amplify/cli"
  exit 1
fi

if [ ! -d "$WEB_DIR/amplify" ]; then
  log_error "No amplify/ directory in $WEB_DIR — run 'amplify init' first"
  exit 1
fi

# Ensure we are on the 'dev' env (non-interactive). Skipped in CI — the workflow
# runs `amplify pull --envName dev --yes` before invoking this script.
if [ "$CI_MODE" = "1" ] || [ "$CI_MODE" = "true" ]; then
  log_info "CI mode — skipping amplify env checkout"
else
  log_info "Ensuring Amplify env 'dev' is active"
  amplify env checkout dev 2>/dev/null || log_warn "Could not auto-checkout 'dev' (may already be active)"
fi

# Publish. In CI we bypass the Amplify CLI (notoriously brittle in headless
# runners) and sync the build directly to the hosting S3 bucket. This is
# functionally what `amplify publish` does for the S3AndCloudFront category.
if [ "$CI_MODE" = "1" ] || [ "$CI_MODE" = "true" ]; then
  HOSTING_BUCKET="${HOSTING_BUCKET:-icopweb-20260424135411-hostingbucket}"
  log_info "CI mode — syncing dist/ → s3://$HOSTING_BUCKET"
  aws s3 sync "$WEB_DIR/dist/" "s3://$HOSTING_BUCKET/" --delete
  log_success "Deployed (S3 sync)"
else
  log_info "Publishing to Amplify hosting…"
  set +e
  amplify publish --yes --invalidateCloudFront
  AMPLIFY_EXIT=$?
  set -e

  if [ $AMPLIFY_EXIT -ne 0 ]; then
    log_error "amplify publish failed (exit $AMPLIFY_EXIT)"
    log_warn  "Common causes:"
    echo     "  · DNS failure → try: sudo dscacheutil -flushcache; switch to 1.1.1.1"
    echo     "  · AWS creds expired → amplify configure"
    echo     "  · Env not pulled → amplify pull --envName dev"
    exit $AMPLIFY_EXIT
  fi
  log_success "Deployed"
fi

# ── Step 3b: CloudFront cache invalidation ──────────────────────────────────
log_header "Step 3b · CloudFront Invalidation"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-E11QT6WLU0YJR5}"
if ! command -v aws >/dev/null 2>&1; then
  log_warn "aws CLI not found — skipping CloudFront invalidation"
else
  log_info "Invalidating $CF_DISTRIBUTION_ID /*"
  set +e
  CF_OUT=$(aws cloudfront create-invalidation \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text 2>&1)
  CF_EXIT=$?
  set -e
  if [ $CF_EXIT -ne 0 ]; then
    log_error "CloudFront invalidation failed: $CF_OUT"
    log_warn  "Check AWS creds / distribution ID and retry manually:"
    echo     "  aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths \"/*\""
  else
    log_success "Invalidation submitted · ID: $CF_OUT"
  fi
fi

# ── Step 4: announce ────────────────────────────────────────────────────────
log_header "Step 4 · Telegram Phase 2 Announcement"
cd "$PROJECT_ROOT"
if [ "$SKIP_ANNOUNCE" = "1" ]; then
  log_warn "SKIP_ANNOUNCE=1 — skipping Telegram announcement"
else
  node "$PROJECT_ROOT/send-release-phase2.js"
  log_success "Announcement sent"
fi

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
