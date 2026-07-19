# Product audit

This audit reflects the source tree before the production UI implementation.
It does not infer production database contents.

| Feature | Current route or file | Status | User impact | Recommended action | DB/API change |
| --- | --- | --- | --- | --- | --- |
| Authentication | `lib/auth`, `/api/auth/session` | Partial | Existing cookies work, but authenticated pages have no guard UI | Preserve session flow; add shell-level session handling | No |
| LINE Login | `/api/auth/line`, callback | Complete with known security debt | Primary production login works | Preserve route and callback byte-for-byte | No |
| LIFF initialization | `lib/client/liff.ts` | Partial | Helper exists but UI does not initialize it | Initialize from browser entry points | No |
| User profile creation | LINE callback | Complete | New LINE users are persisted | Preserve matching and defaults | No |
| Dashboard | `/dashboard` | Missing UI | Placeholder only | Build from monthly summary and recent transactions | Additive summary fields |
| Add income | `/transactions/new`, POST API | Partial | API exists; UI missing | Build one fast income/expense form | Fix server category lookup |
| Add expense | `/transactions/new`, POST API | Partial | API exists; UI missing | Same form as income | Fix server category lookup |
| Transaction history | `/transactions`, GET API | Partial | Search/filter/pagination API exists; UI missing | Build paginated grouped list | No |
| Transaction edit | `/transactions/[id]/edit` | Partial | GET/PATCH API exists; UI missing | Reuse transaction form | No |
| Transaction delete | DELETE transaction API | Partial | No UI confirmation | Add confirmation and refresh | No |
| Categories | `/categories`, category APIs | Partial | CRUD API exists; UI missing | Build compact management UI | No |
| Monthly summary | `/monthly-summary`, summary API | Partial | Data exists; UI missing | Build analytics view | Additive fields |
| Daily summary | `/api/summaries/daily` | Complete API | No direct UI | Use monthly trend instead of repeated calls | No |
| Spending breakdown | Monthly summary API | Complete API | No UI | Ranked accessible bars | No |
| Income breakdown | Not returned | Missing | Income sources cannot be compared | Aggregate additively | Additive response |
| Charts | Recharts installed | Missing | No visual trend | Use compact accessible chart | No new dependency |
| Month comparison | Monthly summary API | Partial | Previous totals exist | Show percentage/delta safely | No |
| Budget management | No model/API | Missing | Cannot track limits | Defer staged backend MVP | Required, deferred |
| Savings goals | No model/API | Missing | Not supported | Defer | Required, deferred |
| Recurring transactions | No model/API | Missing | Not supported | Defer | Required, deferred |
| Search/filtering | Transaction API | Partial | UI missing | Add search, month, type, category | No |
| Export | No endpoint | Missing | No CSV export | P2 staged addition | Required, deferred |
| Empty states | Placeholder pages | Missing | Dead-end experience | Add contextual empty states | No |
| Loading states | Callback spinner only | Partial | Data pages give no feedback | Add skeletons and pending states | No |
| Error handling | Client API errors | Partial | Pages do not surface recovery | Add retry and inline errors | No |
| Mobile usability | Basic responsive classes | Broken/incomplete | No app navigation or forms | Mobile-first shell and bottom nav | No |
| Accessibility | Basic labels only in admin | Partial | Product pages not implemented | Landmarks, focus, live regions, summaries | No |
| Thai locale/currency | Constants only | Partial | No centralized formatter | Add `Intl` utilities for THB/satang | No |
| Timezone | Daily uses `+07`; monthly uses UTC | Broken at boundaries | Month totals may include wrong records | Use Bangkok month boundaries | Additive logic fix |
| Production readiness | Build passes | Partial | Backend exists but product is unusable | Complete UI and regression checks | No destructive change |

## Scope decision

This implementation covers the working backend surface: login, overview,
transactions, categories, monthly analytics, profile, settings, and product
states. Budget, savings, recurring transactions, alerts, and export are deferred
because they require new persistence and API contracts.
