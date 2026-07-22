# Wallet Tree

แอปบันทึกรายรับรายจ่ายที่ใช้งานผ่าน LINE bot และ Web Dashboard โดยแยก frontend, backend, database และ shared contracts ออกจากกันชัดเจน

## Structure

```text
wallet-tree/
├── apps/
│   ├── backend/        NestJS API (prefix /api)
│   └── frontend/       Vite + React + Tailwind
├── packages/
│   ├── database/       Prisma schema, migrations, seed
│   └── shared/         DTOs, response types, enums
├── .claude/
│   └── rules/          backend.md, frontend.md
├── CLAUDE.md
└── pnpm-workspace.yaml
```

รายละเอียดขอบเขตแต่ละ package อยู่ใน [docs/architecture.md](docs/architecture.md)

## Authentication

- ผู้ใช้ทั่วไป: LINE Login เท่านั้น (`LINE` + `USER`)
- ผู้ดูแลระบบ: username/password เท่านั้น (`LOCAL_ADMIN` + `ADMIN`)
- JWT ทุกใบมี provider, role และ session version
- API การเงินใช้ `LineUserGuard` จึงไม่รับ token ของ admin
- หน้า/API admin ไม่รับ token ของ LINE user
- LINE OAuth ใช้ state แบบสุ่ม เซ็นด้วย HMAC และผูกกับ HttpOnly cookie

## Setup

ต้องมี Node.js 22.12+, pnpm 11 และ PostgreSQL

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

ถ้ากำหนด `ADMIN_USERNAME` และ `ADMIN_PASSWORD` ตอน seed ระบบจะสร้าง local admin ให้ โดยรหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษร

## Development

เปิดสอง terminal:

```bash
pnpm backend:dev    # http://localhost:3000/api
pnpm frontend:dev   # http://localhost:5173
```

ตั้ง LINE Login callback เป็น:

```text
http://localhost:3000/api/auth/line/callback
```

## Quality checks

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Vercel deployment

GitHub repository เดียวเชื่อมกับ Vercel สองโปรเจกต์:

- `wallet-tree` — root `apps/frontend`, Vite, `https://wallet-tree.vercel.app`
- `wallet-tree-backend` — root `apps/backend`, NestJS, `https://wallet-tree-backend.vercel.app`

เมื่อ push branch `main` ไป GitHub ทั้งสองโปรเจกต์จะ deploy อัตโนมัติ โดย frontend ต้องมี
`VITE_API_BASE_URL` และ backend ต้องมีตัวแปรตาม `.env.example` งาน recurring ใช้ Vercel Cron
เรียก `/api/cron/recurring` พร้อม `CRON_SECRET` แทน scheduler ที่รันค้างใน process

หลังสร้างหรือเปลี่ยน production PostgreSQL ให้ apply migrations และ seed หนึ่งครั้ง:

```bash
DATABASE_URL='<production-postgres-url>' pnpm db:deploy
DATABASE_URL='<production-postgres-url>' ADMIN_USERNAME='<admin>' ADMIN_PASSWORD='<password>' pnpm db:seed
```
