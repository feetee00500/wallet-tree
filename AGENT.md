# Wallet Tree Repository Structure

## Overview

Wallet Tree is a pnpm monorepo. The frontend and backend currently run together
as one full-stack Next.js application in `apps/web`.

Do not create a separate `apps/api` application without first planning changes
to LINE Login callbacks, LIFF, cookies, sessions, CORS, middleware, and Vercel
deployment.

## Repository tree

```text
wallet-tree/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (app)/
│       │   │   │   ├── categories/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── monthly-summary/
│       │   │   │   ├── profile/
│       │   │   │   ├── settings/
│       │   │   │   └── transactions/
│       │   │   ├── admin/
│       │   │   │   ├── change-password/
│       │   │   │   └── login/
│       │   │   ├── api/
│       │   │   │   ├── auth/
│       │   │   │   │   ├── admin/
│       │   │   │   │   ├── line/
│       │   │   │   │   ├── logout/
│       │   │   │   │   └── session/
│       │   │   │   ├── categories/
│       │   │   │   ├── health/
│       │   │   │   ├── line/
│       │   │   │   ├── profile/
│       │   │   │   ├── summaries/
│       │   │   │   └── transactions/
│       │   │   ├── auth/
│       │   │   │   └── callback/
│       │   │   ├── login/
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── lib/
│       │   │   ├── auth/
│       │   │   ├── client/
│       │   │   ├── db/
│       │   │   └── validation/
│       │   └── middleware.ts
│       ├── public/
│       ├── tests/
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── vitest.config.ts
├── packages/
│   ├── eslint-config/
│   ├── shared/
│   │   └── src/
│   │       ├── constants/
│   │       ├── schemas/
│   │       └── types/
│   └── tsconfig/
├── scripts/
│   ├── admin-cli.ts
│   ├── clean.mjs
│   ├── db-auth.ts
│   └── db-safety.ts
├── docs/
│   ├── admin-maintenance.md
│   └── architecture.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.scripts.json
```

## Application boundaries

### `apps/web`

The only deployable application. It contains:

- User-facing Next.js pages
- Maintenance-admin pages
- Next.js API route handlers
- LINE Login and LIFF integration
- Authentication cookies and sessions
- MongoDB access
- CORS middleware
- Environment validation

The Vercel Root Directory is `apps/web`.

### `packages/shared`

Contains reusable runtime-safe code:

- Zod schemas
- TypeScript domain types
- Constants

Import shared code with:

```ts
import { something } from '@wallet-tree/shared';
```

### Configuration packages

- `packages/eslint-config`: shared ESLint configuration
- `packages/tsconfig`: base and Next.js TypeScript presets

## Source aliases

Inside `apps/web`, `@/*` points to `apps/web/src/*`.

```ts
import { getUsersCollection } from '@/lib/db/models';
```

## Frontend routes

Existing public and application routes:

```text
/
/login
/auth/callback
/dashboard
/transactions
/transactions/new
/transactions/:id/edit
/monthly-summary
/categories
/profile
/settings
/admin/login
/admin/change-password
/admin
```

The regular application pages under `src/app/(app)` provide the production
product UI for overview, transactions, analytics, categories, profile, and
settings. They consume the existing APIs listed below. Budget, savings-goal,
recurring-transaction, alert, and export screens remain intentionally deferred
until backward-compatible persistence and API contracts are designed.

## API routes

```text
/api/health
/api/profile
/api/categories
/api/categories/:id
/api/transactions
/api/transactions/:id
/api/summaries/daily
/api/summaries/monthly
/api/auth/line
/api/auth/line/callback
/api/auth/session
/api/auth/logout
/api/auth/admin/login
/api/auth/admin/change-password
/api/line/webhook
```

Do not change existing API contracts or LINE callback paths without an explicit
migration plan.

## Authentication

Supported providers:

- `line`: the default login method
- `local_admin`: optional maintenance access

Existing LINE users without `authProvider`, `role`, or `status` remain valid.
Runtime compatibility defaults are:

```text
missing authProvider -> line
missing role         -> user
missing status       -> active
```

The current cookie name is:

```text
wallet-tree-session
```

Admin authorization must re-read the user from MongoDB. Do not trust an admin
role solely from session claims.

Local admin login is controlled server-side by:

```text
ENABLE_LOCAL_ADMIN_LOGIN
ADMIN_LOGIN_MAX_ATTEMPTS
ADMIN_LOGIN_LOCKOUT_MINUTES
```

It is disabled by default.

## MongoDB collections

Current collection names:

```text
users
categories
transactions
admin_login_rate_limits
```

Do not rename these collections or destructively migrate existing records.

Existing LINE users are stored in `users` and matched by `lineUserId`. New
maintenance administrators also use `users` with
`authProvider: local_admin`.

Index changes for admin authentication are explicit and must be run manually:

```bash
pnpm db:inspect-auth
pnpm db:ensure-indexes
```

Never run database write commands against production automatically.

## Environment files

The local application environment file is:

```text
apps/web/.env.local
```

It is ignored by Git. Never print, copy, commit, or expose its values.

Use `.env.example` for variable names and safe placeholders only. Only
intentionally browser-visible variables may use `NEXT_PUBLIC_`.

## Common commands

Run commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm dev:web
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:web
pnpm clean
```

Maintenance commands:

```bash
pnpm admin:create
pnpm admin:list
pnpm admin:disable
pnpm admin:enable
pnpm admin:reset-password
pnpm db:inspect-auth
pnpm db:ensure-indexes
```

Database commands use only the MongoDB configuration available in the current
shell. Production writes require explicit confirmation.

## Production safety

- Preserve existing LINE Login behavior and callback URLs.
- Preserve existing MongoDB records and user IDs.
- Do not modify production Vercel variables automatically.
- Do not deploy or commit automatically.
- Do not run destructive Git or MongoDB operations.
- Do not expose passwords, hashes, MongoDB URIs, LINE secrets, or tokens.
- Keep local-admin login disabled until indexes and the initial account have
  been prepared manually.
- Review `docs/admin-maintenance.md` before production admin operations.
