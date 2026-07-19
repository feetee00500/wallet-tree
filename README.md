# Wallet Tree

Wallet Tree is a personal income and expense tracker delivered as a LINE chatbot and a responsive web application.

## Architecture

The repository uses pnpm workspaces. The UI and backend API intentionally remain in one Next.js application because authentication cookies, middleware, LINE Login callbacks, LIFF, and API routes currently share one origin and deployment.

```text
wallet-tree/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/        # App Router pages and API route handlers
│       │   ├── lib/        # Client, auth, database, and validation code
│       │   └── middleware.ts
│       ├── public/
│       ├── tests/
│       └── package.json
├── packages/
│   ├── eslint-config/
│   ├── shared/             # Shared schemas, types, and constants
│   └── tsconfig/
├── scripts/
├── .github/workflows/
└── pnpm-workspace.yaml
```

There is no separate `apps/api` deployment. All `/api/*` handlers run inside `apps/web`. See [docs/architecture.md](docs/architecture.md) for responsibilities and a safe future extraction plan.

## Prerequisites

- Node.js 20 or newer
- pnpm 11.13.0 (Corepack is recommended)
- MongoDB
- LINE Login credentials; LINE Messaging API credentials are required for webhook functionality

## Installation

From the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Do not install dependencies separately inside workspace directories.

## Environment setup

Copy `.env.example` to `apps/web/.env.local`, then replace placeholders locally:

```bash
cp .env.example apps/web/.env.local
```

Variable responsibilities:

- Browser-safe: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_LIFF_ID`
- MongoDB/backend-only: `MONGODB_URI`, `MONGODB_DB_NAME`
- LINE Messaging/backend-only: `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`
- LINE Login/backend-only: `LINE_LOGIN_CHANNEL_ID`, `LINE_LOGIN_CHANNEL_SECRET`, `LINE_LOGIN_CALLBACK_URL`
- Origins/backend-only: `FRONTEND_URL`, `ALLOWED_ORIGINS`
- Security/backend-only: `SESSION_SECRET`, `CSRF_SECRET`
- Maintenance admin: `ENABLE_LOCAL_ADMIN_LOGIN`, `ADMIN_LOGIN_MAX_ATTEMPTS`, `ADMIN_LOGIN_LOCKOUT_MINUTES`

Never add `NEXT_PUBLIC_` to credentials, channel secrets, access tokens, session secrets, or CSRF secrets. Server environment variables are validated with Zod when backend code first needs them.

Local maintenance login is disabled by default. See
[docs/admin-maintenance.md](docs/admin-maintenance.md) before inspecting indexes,
creating an administrator, or enabling the feature.

## Local development

```bash
pnpm dev
pnpm dev:web
pnpm dev:api
```

All three commands start the same combined Next.js runtime at `http://localhost:3000`; `dev:api` exists as a convenience for API-focused work and does not start a second service.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Focused builds:

```bash
pnpm build:web
pnpm build:api
```

`build:api` validates the same combined application because API route handlers are deployed with the web runtime.

Remove generated build/test output with:

```bash
pnpm clean
```

## Routes

User-facing routes include `/`, `/login`, `/auth/callback`, `/dashboard`, `/transactions`, `/monthly-summary`, `/categories`, `/profile`, and `/settings`.

Backend routes remain unchanged under `/api`, including:

- `/api/auth/line`
- `/api/auth/line/callback`
- `/api/auth/session`
- `/api/auth/logout`
- `/api/line/webhook`
- `/api/categories`
- `/api/transactions`
- `/api/profile`
- `/api/summaries/daily`
- `/api/summaries/monthly`
- `/api/health`

## Vercel deployment

Use one Vercel project:

- Root Directory: `apps/web`
- Framework Preset: Next.js
- Install Command: `cd ../.. && pnpm install --frozen-lockfile`
- Build Command: `cd ../.. && pnpm build:web`
- Output Directory: leave blank (Next.js default)
- Include source files outside the Root Directory: enabled, so workspace packages are available

Set all server and public environment variables in the Vercel project. Configure the LINE Login callback as:

```text
https://YOUR_DOMAIN/api/auth/line/callback
```

Configure the LINE Messaging webhook as:

```text
https://YOUR_DOMAIN/api/line/webhook
```

No separate backend Vercel project is required.

## CI

GitHub Actions installs from the repository root with the frozen pnpm lockfile, then runs lint, type checking, tests, and the production build.

## Security notes

- Secret environment files are ignored; only `.env.example` is committed.
- Backend inputs use shared Zod schemas.
- MongoDB connections are cached across development reloads and reused in serverless instances.
- CORS is restricted to configured origins.
- Review the known security gaps in [docs/architecture.md](docs/architecture.md) before public production launch.
