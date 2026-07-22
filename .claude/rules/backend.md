# Backend rules

- Use NestJS modules and the Controller → Service → Repo → Prisma layering.
- Import DTOs and response contracts from `@wallet-tree/shared`.
- Protect finance endpoints with `LineUserGuard`.
- Protect administrator endpoints with `AdminGuard`.
- Never accept provider or role from a login request body.
- Verify LINE webhook signatures and LINE Login OAuth state.
- Add or update adjacent Jest specs for business logic.
