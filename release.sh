#!/bin/bash

##############################################################################
# ICON IMAGE CRM Dashboard — Phase 1 Release Script
#
# Deploys the dashboard to Amplify and sends Telegram announcement to Varvara.
#
# Usage:
#   chmod +x release.sh
#   ./release.sh
#
# Prerequisites:
#   - .env file with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
#   - AWS credentials configured (amplify-uk profile)
#   - Node.js + npm installed
#
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
WEB_DIR="$PROJECT_ROOT/web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_header() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

##############################################################################
# STEP 1: Verify environment
##############################################################################

log_header "Step 1: Verifying environment"

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  log_error ".env file not found"
  echo "Create one from .env.example:"
  echo "  cp $PROJECT_ROOT/.env.example $PROJECT_ROOT/.env"
  echo ""
  echo "Then update with your Telegram credentials."
  exit 1
fi

# Source .env
export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  log_error "TELEGRAM_BOT_TOKEN not set in .env"
  exit 1
fi

if [ -z "$TELEGRAM_CHAT_ID" ]; then
  log_error "TELEGRAM_CHAT_ID not set in .env"
  exit 1
fi

if [ -z "$DASHBOARD_URL" ]; then
  log_warning "DASHBOARD_URL not set, using default"
  DASHBOARD_URL="https://icopweb-dev.amplifyapp.com"
fi

log_success "Environment verified"
log_info "Dashboard URL: $DASHBOARD_URL"
log_info "Bot token: ${TELEGRAM_BOT_TOKEN:0:10}..."
log_info "Chat ID: $TELEGRAM_CHAT_ID"

##############################################################################
# STEP 2: Build the dashboard
##############################################################################

log_header "Step 2: Building dashboard"

cd "$WEB_DIR"

if ! command -v npm &> /dev/null; then
  log_error "npm not found. Install Node.js first."
  exit 1
fi

log_info "Running: npm run build"
npm run build

if [ ! -d "$WEB_DIR/dist" ]; then
  log_error "Build failed: dist/ directory not created"
  exit 1
fi

log_success "Dashboard built successfully"
log_info "Build output: $(du -sh "$WEB_DIR/dist" | cut -f1)"

##############################################################################
# STEP 3: Deploy to Amplify
##############################################################################

log_header "Step 3: Deploying to Amplify"

if ! command -v amplify &> /dev/null; then
  log_error "Amplify CLI not found. Install it:"
  echo "  npm install -g @aws-amplify/cli"
  exit 1
fi

log_info "Checking Amplify status..."
amplify status

log_info "Running: amplify publish"
amplify publish --yes

log_success "Dashboard deployed to Amplify"
log_info "Endpoint: $(amplify status | grep 'Hosting endpoint' | awk '{print $NF}')"

##############################################################################
# STEP 4: Send Telegram announcement
##############################################################################

log_header "Step 4: Sending Telegram announcement"

cd "$PROJECT_ROOT"

if ! command -v node &> /dev/null; then
  log_error "Node.js not found"
  exit 1
fi

if [ ! -f "$PROJECT_ROOT/send-release.js" ]; then
  log_error "send-release.js not found"
  exit 1
fi

log_info "Sending message to Chat ID: $TELEGRAM_CHAT_ID"

if node "$PROJECT_ROOT/send-release.js"; then
  log_success "Telegram announcement sent"
else
  log_error "Failed to send Telegram message"
  exit 1
fi

##############################################################################
# STEP 5: Summary
##############################################################################

log_header "🎉 Release Complete"

echo ""
echo "📊 Dashboard Details:"
echo "  URL: $DASHBOARD_URL"
echo "  Deployment: AWS Amplify (eu-west-2)"
echo "  Build size: $(du -sh "$WEB_DIR/dist" | cut -f1)"
echo ""
echo "📱 Telegram Announcement:"
echo "  Recipient: Chat ID $TELEGRAM_CHAT_ID"
echo "  Status: ✅ Sent"
echo ""
echo "📋 Next Steps:"
echo "  1. Varvara receives the Telegram message with dashboard link"
echo "  2. Share feedback form: FEEDBACK_FORM.md"
echo "  3. Collect feedback via Telegram or structured form"
echo "  4. Document findings in feedback/phase-1/"
echo ""
echo "🔗 Quick Links:"
echo "  Dashboard:     $DASHBOARD_URL"
echo "  Release Notes: $PROJECT_ROOT/RELEASE_NOTES.md"
echo "  Feedback Form: $PROJECT_ROOT/FEEDBACK_FORM.md"
echo ""

log_success "Phase 1 release is live!"

exit 0
