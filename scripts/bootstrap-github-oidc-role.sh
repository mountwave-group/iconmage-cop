#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Bootstrap the GitHub Actions → AWS OIDC role used by the deploy-api workflow.
#
# Creates (idempotently):
#   • IAM role `iconimage-github-actions`
#       trusts: token.actions.githubusercontent.com (existing OIDC provider)
#       sub:    repo:mountwave-group/iconmage-cop:ref:refs/heads/main
#               repo:mountwave-group/iconmage-cop:environment:*
#   • Inline policy `iconimage-github-actions-policy`
#       perms:  ECR push, ECS run-task / describe / wait,
#               CloudFormation read, Lambda update, IAM PassRole (scoped),
#               STS, S3 (Amplify hosting bucket), CloudFront invalidation
#
# Re-run safely: every step is upsert-style.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

AWS_PROFILE="${AWS_PROFILE:-amplify-uk}"
AWS_REGION="${AWS_REGION:-eu-west-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-585008043730}"
GITHUB_OWNER="${GITHUB_OWNER:-mountwave-group}"
GITHUB_REPO="${GITHUB_REPO:-iconmage-cop}"
ROLE_NAME="${ROLE_NAME:-iconimage-github-actions}"
POLICY_NAME="${POLICY_NAME:-iconimage-github-actions-policy}"
OIDC_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

aws_cli() { aws --profile "$AWS_PROFILE" --region "$AWS_REGION" --no-cli-pager "$@"; }

echo "▸ Account=$AWS_ACCOUNT_ID  Repo=$GITHUB_OWNER/$GITHUB_REPO  Role=$ROLE_NAME"

# 1. Trust policy ───────────────────────────────────────────────────────────
TRUST_DOC=$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "${OIDC_ARN}" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:${GITHUB_OWNER}/${GITHUB_REPO}:ref:refs/heads/main",
            "repo:${GITHUB_OWNER}/${GITHUB_REPO}:environment:*"
          ]
        }
      }
    }
  ]
}
JSON
)

if aws_cli iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "▸ Role exists — updating trust policy"
  aws_cli iam update-assume-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-document "$TRUST_DOC"
else
  echo "▸ Creating role"
  aws_cli iam create-role \
    --role-name "$ROLE_NAME" \
    --description "GitHub Actions OIDC for ICON IMAGE deploy pipelines" \
    --max-session-duration 3600 \
    --assume-role-policy-document "$TRUST_DOC" >/dev/null
fi

# 2. Permission policy ──────────────────────────────────────────────────────
PERM_DOC=$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrPush",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeImages",
        "ecr:DescribeRepositories",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EcsRunMigration",
      "Effect": "Allow",
      "Action": [
        "ecs:RunTask",
        "ecs:DescribeTasks",
        "ecs:DescribeTaskDefinition",
        "ecs:ListTasks",
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRoleForEcs",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::${AWS_ACCOUNT_ID}:role/iconimage-*"
      ],
      "Condition": {
        "StringEquals": { "iam:PassedToService": [ "ecs-tasks.amazonaws.com", "lambda.amazonaws.com" ] }
      }
    },
    {
      "Sid": "Cloudformation",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ListStackResources",
        "cloudformation:CreateChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:UpdateStack",
        "cloudformation:CreateStack",
        "cloudformation:DeleteStack",
        "cloudformation:GetTemplateSummary"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaUpdate",
      "Effect": "Allow",
      "Action": [
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunction",
        "lambda:PublishVersion",
        "lambda:UpdateAlias"
      ],
      "Resource": "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:iconimage-*"
    },
    {
      "Sid": "S3WebHosting",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::icopweb-*",
        "arn:aws:s3:::icopweb-*/*",
        "arn:aws:s3:::amplify-icopweb-*",
        "arn:aws:s3:::amplify-icopweb-*/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetDistribution",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CdkAssumeBootstrapRoles",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/cdk-*"
    },
    {
      "Sid": "AmplifyHosting",
      "Effect": "Allow",
      "Action": [
        "amplify:GetApp",
        "amplify:GetBackendEnvironment",
        "amplify:ListBackendEnvironments",
        "amplify:ListApps",
        "amplify:ListBranches",
        "amplify:UpdateApp"
      ],
      "Resource": "*"
    }
  ]
}
JSON
)

echo "▸ Putting inline policy $POLICY_NAME"
aws_cli iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "$PERM_DOC"

ROLE_ARN=$(aws_cli iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
echo
echo "✓ Role ready: $ROLE_ARN"
echo
echo "Update .github/workflows/deploy-api.yml if needed:"
echo "    role-to-assume: $ROLE_ARN"
