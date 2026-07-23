import { AuthLayout } from '../components/AuthLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function Login() {
  return (
    <AuthLayout
      title="เข้าสู่ระบบ"
      subtitle="เชื่อมต่อบัญชี LINE เพื่อใช้งาน Wallet Tree"
    >
      <button
        type="button"
        onClick={() => window.location.assign(`${API_BASE_URL}/api/auth/line`)}
        className="flex min-h-[40px] w-full items-center justify-center gap-3 rounded-[6px] bg-[#555555] px-5 text-sm font-semibold text-white transition hover:bg-[#444444] focus:outline-none focus:ring-2 focus:ring-[#555555] focus:ring-offset-2 focus:ring-offset-canvas"
      >
        <span className="rounded-[4px] bg-white/15 px-2 py-0.5 text-[11px] font-bold">LINE</span>
        ดำเนินการต่อด้วย LINE
      </button>
      <a
        href="/admin/login"
        className="mt-5 block text-center text-[13px] text-mute hover:text-ink"
      >
        Admin login →
      </a>
    </AuthLayout>
  );
}
