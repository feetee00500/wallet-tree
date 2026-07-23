import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import type { AuthResponse } from '@wallet-tree/shared';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { ApiError, apiFetch } from '../lib/api';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiFetch<AuthResponse>('/api/auth/admin/login', {
        method: 'POST',
        body: { username, password },
      });
      await login(result.accessToken);
      navigate('/admin', { replace: true });
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Admin Login" subtitle="สำหรับผู้ดูแลระบบเท่านั้น">
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Input label="Username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" loading={loading}>เข้าสู่ระบบ</Button>
      </form>
      <a href="/login" className="mt-5 block text-center text-[13px] text-mute hover:text-ink">← LINE Login</a>
    </AuthLayout>
  );
}
