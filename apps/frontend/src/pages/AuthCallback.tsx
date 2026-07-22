import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token');
    if (!token) {
      setError('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ กรุณาลองใหม่');
      return;
    }
    window.history.replaceState(null, '', '/auth/callback');
    void login(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('ไม่สามารถยืนยันบัญชี LINE ได้'));
  }, [login, navigate]);

  return (
    <AuthLayout title="กำลังยืนยันบัญชี LINE" subtitle="กรุณารอสักครู่">
      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
          <a href="/login" className="mt-3 block font-medium underline">กลับไปหน้าเข้าสู่ระบบ</a>
        </div>
      ) : (
        <p className="text-center text-sm text-zinc-400">กำลังเข้าสู่ระบบ…</p>
      )}
    </AuthLayout>
  );
}
