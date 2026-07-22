# Admin maintenance

Local admin เก็บในตาราง `User` โดยมี `authProvider=LOCAL_ADMIN`, `role=ADMIN` และ bcrypt `passwordHash` ผู้ใช้ LINE ไม่มี password hash

สร้าง admin สำหรับ environment ใหม่ด้วย `.env`:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=a-unique-password-of-at-least-12-characters
```

จากนั้นรัน `pnpm db:seed` ค่า password ไม่ควรถูก commit และควรถูกถอดออกจาก runtime environment หลัง seed หากระบบ deployment รองรับ

ระบบล็อกบัญชีชั่วคราวตาม `ADMIN_LOGIN_MAX_ATTEMPTS` และ `ADMIN_LOGIN_LOCKOUT_MINUTES` การ disable account หรือเพิ่ม `sessionVersion` จะทำให้ JWT เดิมใช้ไม่ได้
