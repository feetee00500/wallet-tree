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
} from '../components/icons';
import { Logo } from '../components/Logo';
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

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex min-h-[36px] items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium transition',
    isActive
      ? 'bg-canvas-soft-2 text-ink'
      : 'text-body hover:bg-canvas-soft hover:text-ink',
  ].join(' ');

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
    isActive ? 'text-ink' : 'text-mute hover:text-body',
  ].join(' ');

export function RootLayout() {
  const { user, logout } = useAuth();
  const { open: openQuickAdd } = useQuickAdd();

  return (
    <div className="flex min-h-screen bg-canvas-soft text-body">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-hairline bg-canvas sm:flex">
        <div className="flex h-14 items-center justify-center border-b border-hairline px-4">
          <Logo subtitle="Finance console" />
        </div>

        <div className="px-3 pt-3">
          <Button onClick={openQuickAdd} variant="secondary" size="sm" className="w-full justify-center gap-2">
            <PlusIcon className="h-4 w-4" />
            บันทึกรายการ
          </Button>
        </div>

        <p className="px-4 pb-2 pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-mute">Navigation</p>
        <nav className="flex-1 space-y-[2px] px-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full transition-all ${
                      isActive ? 'bg-ink opacity-100' : 'opacity-0'
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
          <div className="m-3 flex items-center gap-3 rounded-[12px] border border-hairline bg-canvas px-3 py-2.5 shadow-[var(--shadow-level-2)]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-hairline bg-canvas-soft-2 text-xs font-semibold text-ink">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
              <p className="flex items-center gap-1.5 truncate text-[10px] text-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-deep" />
                LINE connected
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="ออกจากระบบ"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-mute transition hover:bg-canvas-soft hover:text-error"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-11 items-center justify-between border-b border-hairline bg-canvas/95 px-4 backdrop-blur sm:hidden">
          <Logo subtitle="Finance console" />
          {user ? (
            <button
              type="button"
              onClick={logout}
              aria-label="ออกจากระบบ"
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-mute transition hover:bg-canvas-soft hover:text-error"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          ) : null}
        </header>

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-hairline bg-canvas sm:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
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
