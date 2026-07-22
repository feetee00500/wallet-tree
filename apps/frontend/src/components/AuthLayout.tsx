import type { ReactNode } from 'react';
import { WalletIcon } from './icons';
import { Card } from './ui/Card';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(88,166,255,0.10),transparent_36%)]" />

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-[fadeIn_300ms_ease-out]">
          <header className="mb-5 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              <WalletIcon className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <p className="mt-4 font-heading text-base font-bold tracking-tight text-zinc-200">
              Wallet Tree
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Secure finance console</p>
          </header>

          <Card className="px-6 py-7 sm:px-8">
            <div className="mb-6 text-center">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-100 sm:text-[28px]">
                {title}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
            </div>
            {children}
            {footer ? (
              <footer className="mt-6 text-center text-sm text-zinc-400">{footer}</footer>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
