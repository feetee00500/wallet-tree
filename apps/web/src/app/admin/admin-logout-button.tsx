'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/admin/login');
        router.refresh();
      }}
      className="rounded-lg border border-gray-300 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
