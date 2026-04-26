# --- build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate && npm run build && npm prune --production

# --- runtime stage ---
# AWS Lambda Node.js 20 base image includes the Lambda Runtime Interface Client
# (RIC) and is based on Amazon Linux 2023. The same image is used for ECS
# migration tasks — the task definition overrides ENTRYPOINT to /bin/sh.
FROM public.ecr.aws/lambda/nodejs:20
ENV NODE_ENV=production
# Prisma query engine requires openssl (AL2023 uses dnf)
RUN dnf install -y openssl && dnf clean all
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}/dist
COPY --from=build /app/prisma ${LAMBDA_TASK_ROOT}/prisma
COPY --from=build /app/package*.json ${LAMBDA_TASK_ROOT}/
# Lambda RIC ENTRYPOINT is set by the base image. CMD = module.exportedHandler.
# src/ compiles to dist/src/ because tsconfig.build.json includes prisma/seed.ts
# (outside src/), so TypeScript auto-roots at project root rather than src/.
CMD ["dist/src/lambda.handler"]
