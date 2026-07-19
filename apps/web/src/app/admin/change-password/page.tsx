import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/middleware';
import {
  isUserActive,
  resolveAuthProvider,
  resolveUserRole,
} from '@/lib/auth/user-compat';
import { PasswordChangeForm } from './password-change-form';

export const dynamic = 'force-dynamic';

export default async function AdminChangePasswordPage() {
  const user = await getCurrentUser();
  if (
    !user ||
    resolveAuthProvider(user) !== 'local_admin' ||
    resolveUserRole(user) !== 'admin' ||
    !isUserActive(user)
  ) {
    redirect('/admin/login');
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Change maintenance password</h1>
        <p className="mt-2 mb-8 text-sm text-gray-600">
          Use a unique passphrase of at least 12 characters.
        </p>
        <PasswordChangeForm />
      </div>
    </main>
  );
}
