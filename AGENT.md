# Wallet Tree repository rules

Wallet Tree is a pnpm monorepo with two deployable applications:

- `apps/backend`: NestJS API
- `apps/frontend`: Vite + React SPA

Shared wire contracts belong in `packages/shared`. All PostgreSQL/Prisma files belong in `packages/database`.

Do not add API handlers to the frontend. Backend data access must follow Controller → Service → Repo → Prisma. Regular-user endpoints must use `LineUserGuard`; local credentials are reserved for `LOCAL_ADMIN/ADMIN` accounts.

Run `pnpm typecheck`, `pnpm test`, and `pnpm build` before finishing changes.
