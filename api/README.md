# ICON IMAGE — CRM API

Private NestJS + Prisma + PostgreSQL backend for the ICON IMAGE Corporate Operating Platform.

## Stack
- Node 20, NestJS 10, TypeScript strict mode
- Prisma 5 · PostgreSQL 16
- Passport JWT (15 min access / 7 d refresh, bcrypt 12 rounds)
- AWS S3 presigned uploads (`@aws-sdk/client-s3`)
- class-validator DTOs, Swagger at `/docs`, `@nestjs/throttler` rate limiting

## Local Setup

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

```bash
docker build -t iconimage-api .
docker run --rm -p 4000:4000 --env-file .env iconimage-api
```

Use `npm run prisma:migrate:deploy` in CI to apply migrations without interactive prompts, then run the audit-trigger SQL as a one-shot.
