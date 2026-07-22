# Architecture

## Boundaries

- `apps/frontend`: React Router pages, UI components, auth context และ API client เท่านั้น
- `apps/backend`: NestJS controllers/services/repos, JWT guards, LINE Login และ webhook
- `packages/database`: MongoDB documents/domain types, compatibility mappers, indexes และ seed
- `packages/shared`: DTO classes, response interfaces และ enums ที่ใช้ข้าม wire

Backend ใช้ลำดับ `Module → Controller → Service → Repo → MongoDB` โดย controller ตรวจ request, service ถือ business logic และ repo เป็นขอบเขตเดียวที่เข้าถึง MongoDB

## Authentication flows

### Regular user

1. Frontend ส่ง browser ไป `GET /api/auth/line`
2. Backend สร้าง OAuth state แบบสุ่ม เซ็น HMAC และเก็บใน HttpOnly cookie
3. LINE redirect กลับ `GET /api/auth/line/callback`
4. Backend ตรวจ state, แลก authorization code และ upsert ผู้ใช้เป็น `LINE/USER`
5. JWT ถูกส่งกลับ frontend ผ่าน URL fragment และ fragment ถูกลบทันทีหลังอ่าน
6. `LineUserGuard` ตรวจ JWT, database status, session version, provider และ role

### Administrator

1. Frontend ส่ง username/password ไป `POST /api/auth/admin/login`
2. Backend ค้นเฉพาะ record `LOCAL_ADMIN/ADMIN`, ตรวจ bcrypt hash และ lockout
3. JWT ของ admin เปิดได้เฉพาะ admin surface; API การเงินปฏิเสธ token นี้

ระบบไม่มี register/email-password flow สำหรับผู้ใช้ทั่วไป

## Persistence compatibility

Backend ใช้ MongoDB native driver และอ่าน schema เดิมได้โดยตรง: รองรับทั้ง `ObjectId`/string id, `nameTh`/`name`, type ตัวเล็ก/ตัวใหญ่ และ `transactionDate`/`createdAt` โดย normalize ที่ repository boundary ข้อมูลใหม่เขียนด้วย number สำหรับ amount และเก็บ `transactionDate` ควบคู่ timestamps จึงไม่ต้องย้ายหรือลบ collection เดิม
