# ICON IMAGE — Web

Private React 19 + Vite 8 frontend for the ICON IMAGE Corporate Operating Platform.

## Stack
- React 19, TypeScript 6, Vite 8 (PWA-enabled)
- Tailwind 3 (luxury design tokens; see `index.css`)
- Native `fetch` API client with JWT access/refresh rotation
- ESLint 10 (flat config) + typescript-eslint 8

## Prerequisites

- **Node ≥ 20.19** (Vite 8 requirement). Recommended: Node 22 LTS.
- The CRM API running at the URL configured in `.env`. See [api/README.md](../api/README.md).

## Setup

```bash
cd web
cp .env.example .env       # set VITE_API_URL to your API origin
npm install                # uses .npmrc → legacy-peer-deps=true (vite-plugin-pwa hasn't tagged Vite 8 yet)
npm run dev                # starts Vite at http://localhost:5173
```

The web app shows a login screen until authenticated. Use any seed credential from [api/README.md](../api/README.md#seed-credentials) (e.g. `varvara@iconimage.group` / `Owner!Passw0rd`).

## Environment

| Variable       | Purpose                                                                          |
|----------------|----------------------------------------------------------------------------------|
| `VITE_API_URL` | Base URL of the CRM API. No trailing slash. Defaults to `http://localhost:4000`. |

If the API is fronted by the nginx TLS proxy (the `full` compose profile), point `VITE_API_URL` at `https://<host>`.

## Architecture

```
src/
  api/
    client.ts        ← fetch wrapper, token storage, auto-refresh on 401
    resources.ts     ← typed resource hooks (useClients, useProjects, …)
  auth/
    AuthContext.tsx  ← React context + silent rehydrate on mount
    LoginScreen.tsx  ← gating screen shown until authenticated
  views/             ← top-level screens (Clients wired to live API)
  components/        ← shared layout primitives (Masthead, Sidebar, …)
```

- All API calls go through `request()` in [src/api/client.ts](src/api/client.ts). It attaches the bearer token, attempts a single refresh on 401, and throws `ApiError` on non-2xx responses.
- `AuthProvider` wraps the app in [src/main.tsx](src/main.tsx). Until auth resolves, [src/App.tsx](src/App.tsx) renders the login screen or a loading state.
- Role-gated UI (e.g. lifetime value) checks `user.role` from the auth context — there is no client-side role override.

## Live vs static views

| View            | Source                  |
|-----------------|-------------------------|
| Overview        | static (`data.ts`)      |
| **Clients**     | **live (`/clients`)**   |
| Projects        | static — next iteration |
| Communications  | static                  |
| Finance/Archive | placeholder             |

Static screens still import from [src/data.ts](src/data.ts) until their API endpoints are wired up.

## Scripts

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b && vite build
npm run lint      # ESLint flat config
npm run preview   # serve the production build locally
```

## Production build

PWA manifest and Workbox runtime caching are configured in [vite.config.ts](vite.config.ts). The build produces a static bundle in `dist/` that can be served from any CDN, S3 + CloudFront, or behind the same nginx that fronts the API.
