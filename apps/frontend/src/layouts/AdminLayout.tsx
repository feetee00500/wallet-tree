import type { ComponentType, SVGProps } from 'react';
import { NavLink, Outlet } from 'react-router';
import { HomeIcon, LogOutIcon, ShieldIcon, UsersIcon, WalletIcon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';

interface AdminNavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

const navItems: AdminNavItem[] = [
  { to: '/admin', label: 'ภาพรวม', icon: HomeIcon, end: true },
  { to: '/admin/users', label: 'ผู้ใช้งาน', icon: UsersIcon },
  { to: '/admin/account', label: 'บัญชี Admin', icon: ShieldIcon },
];

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex min-h-10 items-center gap-3 rounded-sm border px-3 py-2 text-[13px] font-medium transition ${
    isActive
      ? 'border-zinc-700 bg-zinc-800 text-cyan-400'
      : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-100'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex flex-1 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium ${
    isActive ? 'text-cyan-400' : 'text-zinc-500'
  }`;

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-zinc-700 bg-zinc-900 sm:flex">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-700 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
            <WalletIcon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <p className="font-heading text-base font-bold">Wallet Tree</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Admin console</p>
          </div>
        </div>

        <p className="px-4 pb-2 pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Administration</p>
        <nav className="flex-1 space-y-1 px-3" aria-label="เมนูผู้ดูแลระบบ">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-md border border-zinc-700 bg-zinc-950/50 p-3">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase text-emerald-400">Administrator active</p>
          <button type="button" onClick={logout} className="mt-3 flex min-h-9 w-full items-center justify-center gap-2 rounded-sm border border-zinc-700 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-rose-300">
            <LogOutIcon className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-12 items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 sm:hidden">
          <span className="font-heading font-bold">Wallet Tree Admin</span>
          <button type="button" onClick={logout} aria-label="ออกจากระบบ" className="flex h-9 w-9 items-center justify-center text-zinc-400">
            <LogOutIcon className="h-4 w-4" />
          </button>
        </header>
        <div className="hidden h-12 items-center justify-between border-b border-zinc-700 bg-zinc-900/80 px-5 sm:flex">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Wallet Tree / Administration</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">System online</span>
        </div>
        <main className="p-4 pb-24 sm:p-5">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-zinc-800 bg-zinc-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden" aria-label="เมนูผู้ดูแลระบบบนมือถือ">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
