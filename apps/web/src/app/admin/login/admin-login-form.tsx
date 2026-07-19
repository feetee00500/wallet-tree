'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const genericError = 'Invalid credentials or account unavailable.';

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.get('identifier'),
          password: form.get('password'),
        }),
      });
      if (!response.ok) throw new Error(genericError);
      const result = (await response.json()) as { redirectTo: string };
      router.replace(result.redirectTo);
      router.refresh();
    } catch {
      setError(genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-foreground">
          Username or email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          maxLength={254}
          className="control mt-1 w-full px-3 text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            maxLength={256}
            className="control min-w-0 flex-1 px-3 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="control px-3 text-sm"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-expense">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="control w-full bg-foreground px-4 font-medium text-canvas"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
