import { AuthLayout } from '../components/AuthLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function Login() {
  return (
    <AuthLayout
      title="เข้าสู่ระบบด้วย LINE"
      subtitle="บัญชีผู้ใช้ทั่วไปเข้าใช้งานผ่าน LINE เท่านั้น ข้อมูลบนเว็บและ LINE bot จะเป็นบัญชีเดียวกัน"
    >
      <button
        type="button"
        onClick={() => window.location.assign(`${API_BASE_URL}/api/auth/line`)}
        className="flex min-h-[40px] w-full items-center justify-center gap-3 rounded-[6px] bg-[#06C755] px-5 text-sm font-semibold text-white transition hover:bg-[#05b94e] focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:ring-offset-2 focus:ring-offset-void-black"
      >
        <span className="rounded-[4px] bg-white/15 px-2 py-0.5 text-[11px] font-bold">LINE</span>
        ดำเนินการต่อด้วย LINE
      </button>
      <p className="mt-5 text-center text-xs leading-5 text-iron">
        ผู้ดูแลระบบใช้หน้าสำหรับ Admin แยกต่างหาก
      </p>
      <a
        href="/admin/login"
        className="mt-2 block text-center text-[13px] text-ash-gray hover:text-bone-white"
      >
        เข้าสู่ระบบ Admin
      </a>
    </AuthLayout>
  );
}
