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
        <div className="rounded-[6px] border border-error/30 bg-error/10 p-4 text-[13px] text-error">
          {error}
          <a href="/login" className="mt-3 block font-medium underline text-link hover:text-link-glow">กลับไปหน้าเข้าสู่ระบบ</a>
        </div>
      ) : (
        <p className="text-center text-[13px] text-mute">กำลังเข้าสู่ระบบ…</p>
      )}
    </AuthLayout>
  );
}
