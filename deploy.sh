#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ICON IMAGE Corporate Operating Platform · end-to-end deployment
#
# Deploys the entire stack in order:
#   1. CDK infra      — Network / Data / Postgres / Migration / Api stacks
#   2. API image      — Docker build + push to ECR
#   3. Migrations     — Prisma migrate deploy + seed (Fargate one-shot task)
#   4. API redeploy   — Force new task definition revision so Lambda picks up image
#   5. Web build      — Vite production build
#   6. Amplify publish — S3 + CloudFront hosting via Amplify CLI
#
# Usage:
#   ./deploy.sh                    # full deploy (all phases)
#   ./deploy.sh infra              # only CDK stacks
#   ./deploy.sh api                # only API image + migrations + Lambda
#   ./deploy.sh web                # only web build + Amplify publish
#   ./deploy.sh --skip-migrations  # full deploy without running Prisma migrate
#   ./deploy.sh --dry-run          # show plan, do nothing
#
# Required env (or AWS CLI profile):
#   AWS_PROFILE        default: amplify-uk
#   AWS_REGION         default: eu-west-2
#   AWS_ACCOUNT_ID     default: 585008043730
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── config ──────────────────────────────────────────────────────────────────
AWS_PROFILE="${AWS_PROFILE:-amplify-uk}"
AWS_REGION="${AWS_REGION:-eu-west-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-585008043730}"
ECR_REPOSITORY="${ECR_REPOSITORY:-iconimage/api}"
ECS_CLUSTER="${ECS_CLUSTER:-iconimage}"
MIGRATION_TASK_DEF="${MIGRATION_TASK_DEF:-iconimage-migration}"
AMPLIFY_ENV="${AMPLIFY_ENV:-dev}"

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"
GIT_SHA="$(git -C "$(dirname "$0")" rev-parse --short HEAD 2>/dev/null || echo "local")"
IMAGE_TAG="${IMAGE_TAG:-$GIT_SHA}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$ROOT_DIR/infra"
API_DIR="$ROOT_DIR/api"
WEB_DIR="$ROOT_DIR/web"

# ── flags ───────────────────────────────────────────────────────────────────
PHASE="all"
SKIP_MIGRATIONS=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    infra|api|web|all) PHASE="$1"; shift ;;
    --skip-migrations) SKIP_MIGRATIONS=1; shift ;;
    --dry-run)         DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# ── helpers ─────────────────────────────────────────────────────────────────
BRONZE='\033[38;5;180m'
DIM='\033[2m'
RED='\033[31m'
RESET='\033[0m'

log()    { echo -e "${BRONZE}▸${RESET} $*"; }
sublog() { echo -e "  ${DIM}$*${RESET}"; }
fail()   { echo -e "${RED}✗ $*${RESET}" >&2; exit 1; }

run() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo -e "${DIM}[dry-run]${RESET} $*"
  else
    eval "$@"
  fi
}

require() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

# ── preflight ───────────────────────────────────────────────────────────────
preflight() {
  log "Preflight"
  require aws
  require docker
  require node
  require npm
  require git
  if [[ "$PHASE" == "all" || "$PHASE" == "infra" || "$PHASE" == "api" ]]; then
    require npx
  fi
  if [[ "$PHASE" == "all" || "$PHASE" == "web" ]]; then
    if ! npx --no-install amplify --version >/dev/null 2>&1 \
       && ! command -v amplify >/dev/null 2>&1; then
      fail "Amplify CLI not found. Install with: npm i -g @aws-amplify/cli"
    fi
  fi

  sublog "AWS account : $AWS_ACCOUNT_ID"
  sublog "AWS region  : $AWS_REGION"
  sublog "AWS profile : $AWS_PROFILE"
  sublog "Image tag   : $IMAGE_TAG"
  sublog "Phase       : $PHASE"
  [[ $DRY_RUN -eq 1 ]] && sublog "Mode        : DRY RUN"

  # Confirm AWS identity
  if [[ $DRY_RUN -eq 0 ]]; then
    aws sts get-caller-identity --profile "$AWS_PROFILE" --region "$AWS_REGION" \
      >/dev/null || fail "AWS credentials invalid for profile '$AWS_PROFILE'."
  fi
}

# ── phase 1 — CDK infra ─────────────────────────────────────────────────────
deploy_infra() {
  log "Phase 1 · CDK infra"
  run "cd '$INFRA_DIR' && npm ci"
  run "cd '$INFRA_DIR' && CDK_DEFAULT_ACCOUNT='$AWS_ACCOUNT_ID' \
       CDK_DEFAULT_REGION='$AWS_REGION' AWS_PROFILE='$AWS_PROFILE' \
       npx cdk deploy --all --require-approval never"
}

# ── phase 2 — API image ─────────────────────────────────────────────────────
deploy_api_image() {
  log "Phase 2 · API image build & push"
  run "cd '$API_DIR' && npm ci"
  run "cd '$API_DIR' && npx prisma generate"
  run "cd '$API_DIR' && npm run lint"
  run "cd '$API_DIR' && npm test -- --passWithNoTests"
  run "cd '$API_DIR' && npm run build"

  log "Login to ECR"
  run "aws ecr get-login-password --region '$AWS_REGION' --profile '$AWS_PROFILE' \
       | docker login --username AWS --password-stdin '$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com'"

  log "Docker build & push  ($IMAGE_TAG, latest)"
  run "docker build --platform linux/amd64 -t '$ECR_URI:$IMAGE_TAG' -t '$ECR_URI:latest' '$API_DIR'"
  run "docker push '$ECR_URI:$IMAGE_TAG'"
  run "docker push '$ECR_URI:latest'"
}

# ── phase 3 — migrations ────────────────────────────────────────────────────
run_migrations() {
  if [[ $SKIP_MIGRATIONS -eq 1 ]]; then
    log "Phase 3 · Migrations  (skipped)"
    return
  fi
  log "Phase 3 · Migrations  (Fargate one-shot)"

  # Subnet & SG ids exposed by MigrationStack outputs
  local subnets sg
  subnets=$(aws cloudformation describe-stacks \
    --stack-name MigrationStack --profile "$AWS_PROFILE" --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='MigrationSubnets'].OutputValue" \
    --output text 2>/dev/null || true)
  sg=$(aws cloudformation describe-stacks \
    --stack-name MigrationStack --profile "$AWS_PROFILE" --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='MigrationSecurityGroup'].OutputValue" \
    --output text 2>/dev/null || true)

  if [[ -z "$subnets" || -z "$sg" ]]; then
    fail "Could not resolve MigrationStack outputs (MigrationSubnets / MigrationSecurityGroup)."
  fi

  local task_arn
  task_arn=$(run "aws ecs run-task \
    --cluster '$ECS_CLUSTER' \
    --launch-type FARGATE \
    --task-definition '$MIGRATION_TASK_DEF' \
    --network-configuration 'awsvpcConfiguration={subnets=[$subnets],securityGroups=[$sg],assignPublicIp=DISABLED}' \
    --profile '$AWS_PROFILE' --region '$AWS_REGION' \
    --query 'tasks[0].taskArn' --output text" || true)

  [[ -z "$task_arn" || "$task_arn" == "None" ]] && fail "run-task did not return an ARN"
  sublog "Task: $task_arn"

  if [[ $DRY_RUN -eq 0 ]]; then
    aws ecs wait tasks-stopped --cluster "$ECS_CLUSTER" --tasks "$task_arn" \
      --profile "$AWS_PROFILE" --region "$AWS_REGION"
    local exit_code
    exit_code=$(aws ecs describe-tasks --cluster "$ECS_CLUSTER" --tasks "$task_arn" \
      --profile "$AWS_PROFILE" --region "$AWS_REGION" \
      --query 'tasks[0].containers[0].exitCode' --output text)
    [[ "$exit_code" != "0" ]] && fail "Migration task exited with code $exit_code"
    sublog "Migrations OK"
  fi
}

# ── phase 4 — API Lambda redeploy ───────────────────────────────────────────
redeploy_api_lambda() {
  log "Phase 4 · ApiStack redeploy (pull latest image)"
  run "cd '$INFRA_DIR' && AWS_PROFILE='$AWS_PROFILE' \
       npx cdk deploy ApiStack --require-approval never --force"
}

# ── phase 5 — web build ─────────────────────────────────────────────────────
build_web() {
  log "Phase 5 · Web build"
  run "cd '$WEB_DIR' && npm ci"
  run "cd '$WEB_DIR' && npm run lint"
  run "cd '$WEB_DIR' && npm run build"
}

# ── phase 6 — Amplify publish ───────────────────────────────────────────────
publish_amplify() {
  log "Phase 6 · Amplify publish ($AMPLIFY_ENV)"
  # `amplify publish --yes` runs the configured frontend build then uploads dist/
  # to the S3 hosting bucket and invalidates CloudFront.
  run "cd '$WEB_DIR' && amplify publish --yes"
}

# ── orchestration ───────────────────────────────────────────────────────────
preflight

case "$PHASE" in
  infra)
    deploy_infra
    ;;
  api)
    deploy_api_image
    run_migrations
    redeploy_api_lambda
    ;;
  web)
    build_web
    publish_amplify
    ;;
  all)
    deploy_infra
    deploy_api_image
    run_migrations
    redeploy_api_lambda
    build_web
    publish_amplify
    ;;
esac

log "Done · $(date -u +%FT%TZ)"
