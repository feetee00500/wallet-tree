import Link from 'next/link';
import { PageHeader } from '@/components/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account / system"
        title="ความปลอดภัยและระบบ"
        description="ข้อมูลสำคัญเกี่ยวกับบัญชีและการเชื่อมต่อของ Wallet Tree"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="font-medium">การยืนยันตัวตน</h2>
          <p className="mt-2 text-sm leading-6 text-subtle">
            บัญชีผู้ใช้ทั่วไปเชื่อมต่อผ่าน LINE Login และข้อมูลแต่ละรายการแยกตามบัญชีของคุณ
          </p>
          <Link href="/profile" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent hover:underline">
            ดูข้อมูลบัญชี
          </Link>
        </section>
        <section className="panel p-5">
          <h2 className="font-medium">รูปแบบข้อมูลการเงิน</h2>
          <p className="mt-2 text-sm leading-6 text-subtle">
            ยอดเงินเก็บเป็นหน่วยสตางค์ แสดงผลเป็น THB และคำนวณวันตาม Asia/Bangkok
          </p>
        </section>
      </div>
      <section className="panel border-warning/25 bg-warning/[0.04] p-5">
        <h2 className="font-medium">ฟีเจอร์ที่ยังไม่เปิดใช้</h2>
        <p className="mt-2 text-sm leading-6 text-subtle">
          งบประมาณ เป้าหมายการออม รายการประจำ และการส่งออกข้อมูล
          ต้องมี backend และแผน migration ที่ตรวจสอบก่อน จึงยังไม่แสดงเป็นเมนูใช้งาน
        </p>
      </section>
    </div>
  );
}
