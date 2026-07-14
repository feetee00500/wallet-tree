'use client';

import { getLoginUrl } from '@/lib/client/auth';

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <h1 className="text-4xl font-bold text-green-700 mb-2">Wallet Tree</h1>
      <p className="text-gray-600 mb-8 text-center">
        เข้าสู่ระบบเพื่อจัดการรายรับรายจ่ายของคุณ
      </p>
      <button
        onClick={handleLogin}
        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        เข้าสู่ระบบด้วย LINE
      </button>
    </div>
  );
}
