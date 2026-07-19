# Maintenance administrator operations

## Compatibility boundary

Maintenance authentication is an additional provider and does not replace LINE
Login. Existing LINE documents remain unchanged and continue to match by
`lineUserId`. Existing cookies retain the name `wallet-tree-session`, and session
claims added for administrators are optional so existing LINE sessions remain
readable.

The production collections discovered from source are:

- `users`
- `categories`
- `transactions`

The maintenance feature additionally uses `admin_login_rate_limits`. Existing
accessors create these indexes automatically during normal requests:

- unique `{ lineUserId: 1 }` on `users`
- `{ userId: 1, key: 1 }` on `categories`
- `{ userId: 1, transactionDate: -1 }` on `transactions`
- `{ userId: 1, type: 1, transactionDate: -1 }` on `transactions`
- `{ userId: 1, categoryId: 1 }` on `transactions`

No existing index is dropped, renamed, or rebuilt by the maintenance commands.

Because the existing `lineUserId` index is unique and non-sparse, every new
local administrator receives an internal value in the reserved
`local_admin:<uuid>` namespace. Explicit `authProvider: local_admin` always takes
precedence when resolving the provider, so this field cannot turn an administrator
into a LINE user or change LINE identity matching.

## Runtime compatibility defaults

- Missing `authProvider` is interpreted as `line`.
- Missing `role` is interpreted as `user`.
- Missing `status` is interpreted as `active`.
- Existing LINE documents are never given passwords or forced to change passwords.
- No command mass-updates existing users to populate optional defaults.
- Password hashes are not returned by session or admin APIs.

## Required environment variables

Keep all existing environment names unchanged and add:

```text
ENABLE_LOCAL_ADMIN_LOGIN
ADMIN_LOGIN_MAX_ATTEMPTS
ADMIN_LOGIN_LOCKOUT_MINUTES
```

Recommended initial values:

```text
ENABLE_LOCAL_ADMIN_LOGIN=false
ADMIN_LOGIN_MAX_ATTEMPTS=5
ADMIN_LOGIN_LOCKOUT_MINUTES=15
```

These are server variables. Do not prefix them with `NEXT_PUBLIC_`.

## Read-only production inspection

Set `MONGODB_URI` and `MONGODB_DB_NAME` in the current shell through your secure
secret-management workflow. Do not place the URI in shell history.

Then run:

```bash
NODE_ENV=production pnpm db:inspect-auth
```

The command reports only the database name, collection names, aggregate user
counts, missing optional-field counts, and index names. It does not print the URI,
personal records, tokens, passwords, or password hashes.

## Explicit index initialization

The command proposes only:

```text
users:
  uniq_local_admin_username_normalized
  key: { usernameNormalized: 1 }
  unique: true
  partial: authProvider == local_admin and usernameNormalized is a string

users:
  uniq_local_admin_email_normalized
  key: { emailNormalized: 1 }
  unique: true
  partial: authProvider == local_admin and emailNormalized is a string

admin_login_rate_limits:
  ttl_admin_login_rate_limits
  key: { expiresAt: 1 }
  expireAfterSeconds: 0
```

Inspect first, then run:

```bash
NODE_ENV=production pnpm db:ensure-indexes --confirm-production
```

The command displays the database name and requires typing both the database name
and `production`. It checks names, keys, uniqueness, partial filters, and TTL
options. Conflicts stop the command; it never calls `dropIndex`, `dropIndexes`, or
rebuilds a collection. Re-running it is idempotent.

## Create the first production administrator

Keep local admin login disabled while creating the first account:

```bash
NODE_ENV=production pnpm admin:create \
  --username maintenance-admin \
  --email admin@example.com \
  --confirm-production
```

The command displays the target database name, requires two explicit production
confirmations, and then prompts for the password twice without echo. Passwords
cannot be supplied as command arguments. The initial record has
`mustChangePassword: true`.

Other commands follow the same safety rules:

```bash
NODE_ENV=production pnpm admin:list
NODE_ENV=production pnpm admin:disable --username maintenance-admin --confirm-production
NODE_ENV=production pnpm admin:enable --username maintenance-admin --confirm-production
NODE_ENV=production pnpm admin:reset-password --username maintenance-admin --confirm-production
```

`admin:list` is read-only. All writes display and confirm the target database;
production writes additionally require `--confirm-production` and the second
interactive confirmation.

## Staged deployment

### Stage 1: disabled code deployment

1. Set `ENABLE_LOCAL_ADMIN_LOGIN=false`.
2. Set the attempt and lockout variables.
3. Deploy the code through the normal reviewed Vercel workflow.
4. Verify LINE Login, session restoration, transactions, categories, profile,
   summaries, LIFF, and the unchanged LINE callback.
5. Run `pnpm db:inspect-auth` using the read-only procedure above.

### Stage 2: database preparation

1. Review the inspection output for index conflicts.
2. Run `pnpm db:ensure-indexes --confirm-production`.
3. Re-run inspection and verify the three expected index names.
4. Run `pnpm admin:create ... --confirm-production`.
5. Keep the feature disabled until the account and indexes are confirmed.

### Stage 3: enable maintenance login

1. Set `ENABLE_LOCAL_ADMIN_LOGIN=true` in Vercel.
2. Redeploy through the normal reviewed workflow.
3. Verify `/admin/login`.
4. Log in with the initial password.
5. Immediately complete `/admin/change-password`.
6. Verify `/admin`, logout, and a second login with the new password.
7. Re-verify LINE Login and an existing LINE session.

## Rollback

To disable maintenance authentication without reverting the release:

1. Set `ENABLE_LOCAL_ADMIN_LOGIN=false` in Vercel.
2. Redeploy.
3. Verify the admin login endpoint returns the generic unavailable response.
4. Leave administrator documents and additive indexes in MongoDB.
5. Verify LINE Login remains operational.

Disabling the flag does not delete administrator records, change LINE users,
rename collections, or alter existing LINE callback URLs.

## Deferred security phases

This feature intentionally does not rewrite the existing authentication system.
Separate reviewed phases should address:

- Signing or encrypting the current base64 session cookie.
- LINE OAuth state generation and verification.
- Broader CSRF enforcement.
- LINE webhook signature verification.
- Global API rate limiting.
- Avoiding automatic index creation during application requests.
