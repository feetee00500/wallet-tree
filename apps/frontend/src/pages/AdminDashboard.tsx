import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <section className="mx-auto max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-xs uppercase tracking-widest text-emerald-400">Restricted / Admin</p>
        <h1 className="mt-2 text-2xl font-semibold">Wallet Tree Administration</h1>
        <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-zinc-500">ชื่อ</dt><dd>{user?.name}</dd>
          <dt className="text-zinc-500">Username</dt><dd>{user?.username}</dd>
          <dt className="text-zinc-500">Provider</dt><dd>{user?.authProvider}</dd>
          <dt className="text-zinc-500">Role</dt><dd>{user?.role}</dd>
        </dl>
        <button onClick={logout} className="mt-8 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">ออกจากระบบ</button>
      </section>
    </main>
  );
}
