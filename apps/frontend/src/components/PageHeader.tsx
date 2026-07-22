import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-zinc-700 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-400">Finance module</p>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-100 sm:text-[28px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-[13px] text-zinc-400">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
