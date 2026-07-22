import type { ComponentType, SVGProps } from 'react';
import { NavLink, Outlet } from 'react-router';
import {
  ChartBarIcon,
  HomeIcon,
  ListIcon,
  LogOutIcon,
  PlusIcon,
  RepeatIcon,
  SettingsIcon,
  TagIcon,
  WalletIcon,
} from '../components/icons';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useQuickAdd } from '../contexts/QuickAddContext';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'ภาพรวม', icon: HomeIcon },
  { to: '/transactions', label: 'รายการ', icon: ListIcon },
  { to: '/categories', label: 'หมวดหมู่', icon: TagIcon },
  { to: '/recurring', label: 'รายการประจำ', icon: RepeatIcon },
  { to: '/budget', label: 'งบประมาณ', icon: ChartBarIcon },
  { to: '/settings', label: 'ตั้งค่า', icon: SettingsIcon },
];

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex min-h-10 items-center gap-3 rounded-sm border border-transparent px-3 py-2 text-[13px] font-medium transition',
    isActive
      ? 'border-zinc-700 bg-zinc-800 text-cyan-400'
      : 'text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-100',
  ].join(' ');

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
    isActive ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-200',
  ].join(' ');

export function RootLayout() {
  const { user, logout } = useAuth();
  const { open: openQuickAdd } = useQuickAdd();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-zinc-700 bg-zinc-900 sm:flex">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-700 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
            <WalletIcon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-base font-bold tracking-tight text-zinc-100">
              Wallet Tree
            </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Finance console</p>
          </div>
        </div>

        <div className="px-3 pt-3">
          <Button onClick={openQuickAdd} size="sm" className="w-full justify-center gap-2">
            <PlusIcon className="h-4 w-4" />
            บันทึกรายการ
          </Button>
        </div>

        <p className="px-4 pb-2 pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Workspace</p>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={sidebarLinkClass}>
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all ${
                      isActive ? 'bg-cyan-400 opacity-100' : 'opacity-0'
                    }`}
                  />
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <div className="m-3 flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-950/50 px-3 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-cyan-500/10 text-xs font-semibold text-cyan-400 ring-1 ring-cyan-400/30">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-100">{user.name}</p>
              <p className="flex items-center gap-1.5 truncate text-[10px] text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />LINE connected</p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="ออกจากระบบ"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-rose-400"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-zinc-700 bg-zinc-900/95 px-4 backdrop-blur sm:hidden">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
              <WalletIcon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="font-heading text-base font-bold tracking-tight">Wallet Tree</span>
          </div>
          {user ? (
            <button
              type="button"
              onClick={logout}
              aria-label="ออกจากระบบ"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-rose-400"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          ) : null}
        </header>

        <div className="hidden h-12 items-center justify-between border-b border-zinc-700 bg-zinc-900/80 px-5 sm:flex">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Wallet Tree / Finance Operations</p>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />System online</span>
            <span>Asia/Bangkok</span>
          </div>
        </div>

        <main className="flex-1 p-4 pb-28 sm:p-5 sm:pb-5">
          <Outlet />
        </main>
      </div>

      <button
        type="button"
        onClick={openQuickAdd}
        aria-label="บันทึกรายการ"
        className="fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-500 text-white shadow-lg shadow-black/40 transition active:bg-cyan-400 sm:hidden"
      >
        <PlusIcon className="h-6 w-6" strokeWidth={2.4} />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-zinc-800 bg-zinc-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={`absolute inset-x-3 top-0 h-0.5 rounded-full bg-cyan-400 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <item.icon className="h-5 w-5" />
                <span className="leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
