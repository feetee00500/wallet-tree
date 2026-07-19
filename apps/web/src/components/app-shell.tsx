'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSession, logout } from '@/lib/client/auth';
import {
  AccountIcon,
  AnalyticsIcon,
  CategoriesIcon,
  LogoutIcon,
  OverviewIcon,
  PlusIcon,
  TransactionsIcon,
} from './icons';
import { LoadingSkeleton } from './ui';

const navigation = [
  { href: '/dashboard', label: 'ภาพรวม', icon: OverviewIcon },
  { href: '/transactions', label: 'รายการ', icon: TransactionsIcon },
  { href: '/monthly-summary', label: 'วิเคราะห์', icon: AnalyticsIcon },
  { href: '/categories', label: 'หมวดหมู่', icon: CategoriesIcon },
  { href: '/profile', label: 'บัญชี', icon: AccountIcon },
];

export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 rounded-sm">
      <span className="grid size-8 place-items-center rounded-md border border-accent/50 bg-accent/10 font-mono text-xs font-semibold text-accent">
        W
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-tight">Wallet Tree</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-subtle">
          Finance console
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useQuery({ queryKey: ['session'], queryFn: getSession });

  if (session.isPending) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <LoadingSkeleton rows={6} />
      </main>
    );
  }

  if (session.isError) return null;

  const user = session.data;
  const initials = user.displayName?.trim().slice(0, 1).toUpperCase() || 'W';

  async function signOut() {
    await logout();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line/70 bg-surface px-3 py-5 lg:flex">
        <Brand />
        <nav className="mt-9 space-y-1" aria-label="เมนูหลัก">
          {navigation.map(({ href, label, icon: NavIcon }) => {
            const active = isNavigationActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium duration-ui ease-ui ${
                  active
                    ? 'border border-accent/30 bg-accent/[0.08] text-accent'
                    : 'border border-transparent text-subtle hover:border-line/60 hover:bg-elevated hover:text-foreground'
                }`}
              >
                <NavIcon className="size-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-line/50 pt-4">
          <div className="flex items-center gap-3 px-2">
            {user.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.pictureUrl} alt="" className="size-9 rounded-lg object-cover" />
            ) : (
              <span className="grid size-9 place-items-center rounded-lg bg-muted text-sm font-medium">
                {initials}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.displayName}</p>
              <p className="truncate text-xs text-subtle">บัญชีส่วนตัว</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="grid size-10 place-items-center rounded-lg text-subtle hover:bg-muted hover:text-foreground"
              aria-label="ออกจากระบบ"
            >
              <LogoutIcon className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/70 bg-canvas px-4 lg:hidden">
        <Brand />
        <Link
          href="/transactions/new"
          className="control inline-flex items-center gap-2 bg-foreground px-3 text-sm font-medium text-canvas"
        >
          <PlusIcon className="size-4" />
          เพิ่มรายการ
        </Link>
      </header>

      <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:ml-60 lg:px-8 lg:pb-12 lg:pt-8">
        {children}
      </main>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line/80 bg-surface px-1 pt-1.5 lg:hidden"
        aria-label="เมนูมือถือ"
      >
        {navigation.map(({ href, label, icon: NavIcon }) => {
          const active = isNavigationActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium ${
                active ? 'bg-accent/[0.09] text-accent' : 'text-subtle'
              }`}
            >
              <NavIcon className="size-[19px]" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
