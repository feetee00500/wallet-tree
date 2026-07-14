'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/client/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('การยืนยันตัวตนล้มเหลว กรุณาลองอีกครั้ง');
      return;
    }

    getSession()
      .then(() => router.replace('/dashboard'))
      .catch(() => setError('ไม่สามารถยืนยันตัวตนได้ กรุณาลองอีกครั้ง'));
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => router.push('/login')} className="text-green-600 underline">
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
