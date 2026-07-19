'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/client/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('error')) {
      setError('การยืนยันตัวตนล้มเหลว กรุณาลองอีกครั้ง');
      return;
    }
    getSession()
      .then(() => router.replace('/dashboard'))
      .catch(() => setError('ไม่สามารถยืนยันบัญชีได้ กรุณาเริ่มเข้าสู่ระบบใหม่'));
  }, [router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <section className="panel w-full max-w-sm p-6 text-center" aria-live="polite">
        <span className={`mx-auto grid size-10 place-items-center rounded-lg border ${
          error ? 'border-expense/30 bg-expense/10 text-expense' : 'border-accent/30 bg-accent/10 text-accent'
        }`}>
          {error ? '!' : 'W'}
        </span>
        <h1 className="mt-5 text-lg font-semibold">
          {error ? 'เข้าสู่ระบบไม่สำเร็จ' : 'กำลังยืนยันบัญชี'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-subtle">
          {error ?? 'กำลังตรวจสอบ session และเตรียมข้อมูลการเงินของคุณ'}
        </p>
        {!error && (
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 bg-accent motion-safe:animate-pulse" />
          </div>
        )}
        {error && (
          <Link
            href="/login"
            className="control mt-6 inline-flex w-full items-center justify-center bg-foreground px-4 text-sm font-medium text-canvas"
          >
            กลับไปเข้าสู่ระบบ
          </Link>
        )}
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-canvas px-4">
          <p className="text-sm text-subtle">กำลังเตรียมการยืนยันตัวตน…</p>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
