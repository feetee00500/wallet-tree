import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSession } from '@/lib/auth';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('การยืนยันตัวตนล้มเหลว กรุณาลองอีกครั้ง');
      return;
    }

    getSession()
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('ไม่สามารถยืนยันตัวตนได้ กรุณาลองอีกครั้ง'));
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="text-green-600 underline"
        >
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
