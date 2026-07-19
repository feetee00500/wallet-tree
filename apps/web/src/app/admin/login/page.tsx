import Link from 'next/link';
import { AdminLoginForm } from './admin-login-form';
import { isLocalAdminLoginEnabled } from '@/lib/validation/env';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const enabled = isLocalAdminLoginEnabled();

  return (
    <main className="ledger-grid min-h-screen bg-canvas px-4 py-12">
      <div className="panel mx-auto max-w-md p-6 sm:p-8">
        <p className="technical-label mb-3 text-accent">Restricted / local admin</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Maintenance Admin</h1>
        <p className="mb-8 mt-2 text-sm text-subtle">
          Restricted access for authorized maintenance administrators.
        </p>
        {enabled ? (
          <AdminLoginForm />
        ) : (
          <p className="rounded-lg bg-muted p-4 text-sm text-subtle">
            Maintenance login is unavailable.
          </p>
        )}
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 items-center text-sm text-accent hover:underline"
        >
          Back to LINE Login
        </Link>
      </div>
    </main>
  );
}
