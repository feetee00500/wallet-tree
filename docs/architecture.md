# Architecture

## Current deployment boundary

`apps/web` is a full-stack Next.js application. User-facing App Router pages and backend route handlers share one runtime and origin. This boundary is intentional:

- Session cookies are created and read by same-origin route handlers.
- Middleware applies CORS behavior to `/api/*`.
- LINE Login redirects to `/api/auth/line/callback`.
- The browser client defaults to same-origin API requests.
- LIFF initializes in the browser while authenticated API calls use the same deployment.
- Vercel deploys one atomic application.

Splitting the route handlers into `apps/api` now would require explicit cross-origin cookie, callback, CORS, CSRF, and deployment changes. That would be a behavior change, so this refactor does not create a second application.

## Responsibilities

- `apps/web/src/app`: UI routes, layouts, and Next.js API route handlers.
- `apps/web/src/lib/client`: browser-only API, authentication, and LIFF integration.
- `apps/web/src/lib/auth`: server authentication, session, and CORS helpers.
- `apps/web/src/lib/db`: MongoDB connection and persistence models.
- `apps/web/src/lib/validation`: server environment validation.
- `packages/shared`: runtime-safe schemas, domain types, and constants shared across application boundaries.
- `packages/eslint-config`: workspace lint configuration.
- `packages/tsconfig`: workspace TypeScript presets.

## Future API extraction

Extract an `apps/api` workspace only when independent deployment or scaling is required. Before extraction:

1. Define the API origin and versioning strategy without changing existing contracts.
2. Decide whether sessions remain cookies or move to a token exchange.
3. Add signed, integrity-protected sessions and enforce CSRF state validation.
4. Test `SameSite`, `Secure`, cookie domain, credentials, and CORS behavior across origins.
5. Move LINE callback and webhook URLs in the LINE console during a coordinated deployment.
6. Update `NEXT_PUBLIC_API_BASE_URL` and verify LIFF inside and outside the LINE client.
7. Add end-to-end tests for login, callback, session, logout, webhook verification, and all API routes.

## Security review findings

The refactor preserves existing business and authentication behavior, so the following pre-existing risks require a separate security change:

- Session payloads are base64 encoded but are not signed or encrypted.
- The LINE Login `state` value is static and is not validated, leaving login CSRF protection incomplete.
- `CSRF_SECRET` is validated but is not currently used.
- The LINE webhook handler does not currently verify `x-line-signature`.
- The webhook logs user identifiers and message text.
- API rate limiting is not implemented.

Local maintenance authentication and its narrowly scoped durable login limiter are
documented in [admin-maintenance.md](admin-maintenance.md). That feature does not
change the existing LINE OAuth flow or global API security behavior.

Do not expose MongoDB credentials, LINE secrets or access tokens, session secrets, or CSRF secrets to browser bundles.
