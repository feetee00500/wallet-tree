import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/middleware';
import {
  isUserActive,
  resolveAuthProvider,
  resolveUserRole,
} from '@/lib/auth/user-compat';
import { AdminLogoutButton } from './admin-logout-button';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (
    !user ||
    resolveAuthProvider(user) !== 'local_admin' ||
    resolveUserRole(user) !== 'admin' ||
    !isUserActive(user)
  ) {
    redirect('/admin/login');
  }
  if (user.mustChangePassword) redirect('/admin/change-password');

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Maintenance Admin</h1>
        <dl className="my-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="font-medium text-gray-600">Display name</dt>
          <dd>{user.displayName}</dd>
          <dt className="font-medium text-gray-600">Account</dt>
          <dd>{user.username || user.email}</dd>
          <dt className="font-medium text-gray-600">Status</dt>
          <dd>Active</dd>
          <dt className="font-medium text-gray-600">Last login</dt>
          <dd>{user.lastLoginAt?.toISOString() || 'Not recorded'}</dd>
        </dl>
        <AdminLogoutButton />
      </div>
    </main>
  );
}
