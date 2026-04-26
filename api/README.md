# ICON IMAGE — CRM API

Private NestJS + Prisma + PostgreSQL backend for the ICON IMAGE Corporate Operating Platform.

## Stack
- Node 20, NestJS 11, TypeScript 5.7 strict mode
- Prisma 6 · PostgreSQL 16
- Passport JWT (15 min access / 7 d refresh, bcrypt 12 rounds)
- AWS S3 presigned uploads (`@aws-sdk/client-s3`)
- class-validator DTOs, Swagger at `/docs`, `@nestjs/throttler` rate limiting
- ESLint 9 (flat config) + Prettier 3

## Prerequisites

- **Docker ≥ 24** with the Compose plugin (`docker compose version`).  
  If `docker compose` reports "unknown command", symlink the binary:
  ```bash
  sudo mkdir -p /usr/lib/docker/cli-plugins
  sudo ln -sf /usr/local/bin/docker-compose /usr/lib/docker/cli-plugins/docker-compose
  ```
- Node 20 + npm (only needed for local dev without Docker).

## Local Setup (dev, no TLS)

```bash
cd api
cp .env.example .env           # fill in JWT secrets and (optional) AWS creds
npm install
docker compose up -d postgres
npm run prisma:migrate         # applies schema
docker compose exec -T postgres psql -U iconimage -d iconimage < prisma/sql/audit_immutable.sql   # install audit triggers
npm run seed                   # creates seed users & sample project
npm run start:dev
```

Swagger UI → <http://localhost:4000/docs>

### Optional local S3 (MinIO)

```bash
docker compose --profile local-s3 up -d minio
# create bucket via MinIO console at http://localhost:9001
# then set in .env:
#   S3_ENDPOINT=http://localhost:9000
#   S3_FORCE_PATH_STYLE=true
#   AWS_ACCESS_KEY_ID=minioadmin
#   AWS_SECRET_ACCESS_KEY=minioadmin
```

## Seed credentials

| Role      | Email                          | Password             |
|-----------|--------------------------------|----------------------|
| OWNER     | varvara@iconimage.group        | `Owner!Passw0rd`     |
| PM_LEAD   | aubry@iconimage.group          | `PmLead!Passw0rd`    |
| PM        | nakamura@iconimage.group       | `Pm!Passw0rd`        |
| PERFORMER | devos@iconimage.group          | `Performer!Passw0rd` |

**Rotate before any non-local environment.**

## API Surface

| Route                              | Method | Roles                        |
|------------------------------------|--------|------------------------------|
| `/auth/login`                      | POST   | public                       |
| `/auth/refresh`                    | POST   | public                       |
| `/auth/me`                         | GET    | any authenticated            |
| `/auth/logout`                     | POST   | any authenticated            |
| `/clients`                         | GET    | OWNER, PM_LEAD, PM, PERFORMER (scoped) |
| `/clients`                         | POST   | OWNER, PM_LEAD               |
| `/clients/:id`                     | GET    | OWNER, PM_LEAD, PM, PERFORMER (scoped) |
| `/clients/:id`                     | PATCH  | OWNER, PM_LEAD               |
| `/clients/:id`                     | DELETE | OWNER (soft → ARCHIVED)      |
| `/projects`                        | GET    | OWNER, PM_LEAD, PM, PERFORMER (scoped) |
| `/projects`                        | POST   | OWNER, PM_LEAD, PM           |
| `/projects/:id`                    | GET    | OWNER, PM_LEAD, PM, PERFORMER (scoped) |
| `/projects/:id`                    | PATCH  | OWNER, PM_LEAD, PM (owned)   |
| `/projects/:id`                    | DELETE | OWNER                        |
| `/projects/:id/roadmap`            | GET    | OWNER, PM_LEAD, PM, PERFORMER (scoped) |
| `/projects/:id/tasks`              | POST   | OWNER, PM_LEAD, PM (owned)   |
| `/projects/:id/tasks/:taskId`      | PATCH  | OWNER, PM_LEAD, PM (owned)   |
| `/storage/presign-upload`          | POST   | OWNER, PM_LEAD, PM, PERFORMER|
| `/storage/:id/download`            | GET    | OWNER, PM_LEAD, PM, PERFORMER, CLIENT (visibility-gated) |
| `/storage/:id`                     | DELETE | OWNER or file owner          |

### Role scoping

- **OWNER / PM_LEAD** — full visibility.
- **PM** — clients where `assignedPmId = user.id`; projects where `pmId = user.id` or client assigned to them.
- **PERFORMER** — only projects with a matching `ProjectMember` row; clients reachable through those projects.
- **CLIENT** — **deferred to Phase 4.** Guard throws 403 until invitation/provisioning flow ships.

## Audit Log

Every mutation on `/clients`, `/projects`, `/projects/:id/tasks`, `/storage/*` writes an `activity_log` row *inside* the same Prisma transaction. Rows are enforced immutable by the Postgres triggers in [`prisma/sql/audit_immutable.sql`](prisma/sql/audit_immutable.sql) — `UPDATE`/`DELETE` raise `insufficient_privilege`.

## Security Defaults

- All routes are authenticated unless tagged `@Public()`.
- `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`.
- Helmet + compression + CORS allowlist from `CORS_ORIGIN`.
- Throttler: 60 req/min global, 10/min on `/auth/login`.
- Passwords: bcrypt, configurable rounds (default 12).
- Refresh tokens hashed at rest (`User.refreshTokenHash`); rotation on every refresh.
- S3: presigned URLs only — the API process never handles file bytes.
- File size cap (50 MB default) and MIME allowlist (PDF, DOCX, ZIP, PNG, JPEG, MP4).

## Testing

```bash
npm test                 # unit
npm run test:e2e         # requires running postgres + seed
```

The e2e suites cover login/me, client role scoping, audit-log immutability.

## Deployment

The `full` profile starts **postgres + api + nginx**. nginx terminates TLS on port 443 and proxies to the API container; port 4000 is not exposed directly.

```bash
cd api
cp .env.example .env   # set JWT secrets, CORS_ORIGIN, NODE_ENV=production
docker compose --profile full up --build
```

On first start nginx generates a **self-signed certificate** (valid 10 years) and stores it in the `nginx_certs` Docker volume. The browser will show a certificate warning — accept it for dev/staging. For production, replace the volume contents with a valid certificate or front the stack with a CDN/load-balancer that handles TLS.

| Endpoint              | URL                             |
|-----------------------|---------------------------------|
| API (HTTPS)           | `https://<host>/`               |
| Swagger UI            | `https://<host>/docs`           |
| HTTP → HTTPS redirect | port 80 redirects automatically |

> **Prisma binary targets** — `schema.prisma` declares `debian-openssl-3.0.x` alongside `native` so the query engine resolves correctly inside the Node 20 Bookworm-slim container.

### Standalone (postgres already running)

```bash
docker build -t iconimage-api .
docker run --rm -p 4000:4000 --env-file .env \
  -e DATABASE_URL=postgresql://iconimage:iconimage@host.docker.internal:5432/iconimage?schema=public \
  iconimage-api
```

Use `npm run prisma:migrate:deploy` in CI to apply migrations without interactive prompts, then run the audit-trigger SQL as a one-shot.
