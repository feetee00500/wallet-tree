'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function PasswordChangeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.get('currentPassword'),
          newPassword: form.get('newPassword'),
          confirmPassword: form.get('confirmPassword'),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        redirectTo?: string;
      };
      if (!response.ok || !result.redirectTo) {
        throw new Error(result.message || 'Unable to change password.');
      }
      router.replace(result.redirectTo);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {[
        ['currentPassword', 'Current password', 'current-password'],
        ['newPassword', 'New password', 'new-password'],
        ['confirmPassword', 'Confirm new password', 'new-password'],
      ].map(([name, label, autocomplete]) => (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            id={name}
            name={name}
            type="password"
            autoComplete={autocomplete}
            required
            minLength={name === 'currentPassword' ? undefined : 12}
            maxLength={256}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          />
        </div>
      ))}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-700 px-4 py-3 font-medium text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
      >
        {loading ? 'Updating…' : 'Change password'}
      </button>
    </form>
  );
}
