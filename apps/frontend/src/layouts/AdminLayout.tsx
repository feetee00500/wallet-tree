import type { ComponentType, SVGProps } from 'react';
import { NavLink, Outlet } from 'react-router';
import { HomeIcon, LogOutIcon, ShieldIcon, UsersIcon } from '../components/icons';
import { Logo } from '../components/Logo';
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
  `group relative flex min-h-[36px] items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium transition ${
    isActive
      ? 'bg-charcoal text-iris-violet'
      : 'text-iron hover:bg-charcoal/40 hover:text-bone-white'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex flex-1 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium ${
    isActive ? 'text-iris-violet' : 'text-ash-gray'
  }`;

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-void-black text-bone-white">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-graphite-hairline sm:flex">
        <div className="flex h-14 items-center justify-center border-b border-graphite-hairline px-4">
          <Logo subtitle="Admin console" />
        </div>

        <p className="px-4 pb-2 pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-iron">Administration</p>
        <nav className="flex-1 space-y-[2px] px-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full transition-all ${
                      isActive ? 'bg-iris-violet opacity-100' : 'opacity-0'
                    }`}
                  />
                  <item.icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <div className="m-3 flex items-center gap-3 rounded-[16px] border border-graphite-hairline bg-void-black px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-graphite-hairline bg-charcoal/30 text-xs font-semibold text-iris-violet">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-bone-white">{user.name}</p>
              <p className="flex items-center gap-1.5 truncate text-[10px] text-iron">
                <span className="h-1.5 w-1.5 rounded-full bg-pulse-green" />
                Admin
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="ออกจากระบบ"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-ash-gray transition hover:bg-charcoal/30 hover:text-alarm-red"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-11 items-center justify-between border-b border-graphite-hairline bg-void-black/95 px-4 backdrop-blur sm:hidden">
          <p className="text-sm font-bold tracking-tight">Admin</p>
          {user ? (
            <button
              type="button"
              onClick={logout}
              aria-label="ออกจากระบบ"
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-ash-gray transition hover:bg-charcoal/30 hover:text-alarm-red"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          ) : null}
        </header>

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-graphite-hairline bg-void-black sm:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
            {({ isActive }) => (
              <>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
