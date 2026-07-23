import type { ReactNode } from 'react';
import { Card } from './ui/Card';
import { Logo } from './Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-canvas-soft text-body">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-[fadeIn_300ms_ease-out]">
          <header className="mb-8 flex flex-col items-center text-center">
            <Logo />
          </header>

          <Card className="px-5 py-6 sm:px-6">
            <div className="mb-5 text-center">
              <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[24px]">
                {title}
              </h1>
              <p className="mt-2 text-[13px] text-body">{subtitle}</p>
            </div>
            {children}
            {footer ? (
              <footer className="mt-6 text-center text-[13px] text-mute">{footer}</footer>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
