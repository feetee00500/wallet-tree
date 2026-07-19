import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatSatang } from '@/lib/finance/format';

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="technical-label mb-2 text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-[2rem]">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-subtle">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function MoneyValue({
  amount,
  tone = 'default',
  className = '',
}: {
  amount: number;
  tone?: 'default' | 'income' | 'expense';
  className?: string;
}) {
  const toneClass =
    tone === 'income' ? 'text-income' : tone === 'expense' ? 'text-expense' : 'text-foreground';
  return <span className={`money ${toneClass} ${className}`}>{formatSatang(amount)}</span>;
}

export function MetricCard({
  label,
  amount,
  tone,
  detail,
}: {
  label: string;
  amount: number;
  tone?: 'default' | 'income' | 'expense';
  detail?: ReactNode;
}) {
  return (
    <section className="min-w-0 bg-surface p-4 sm:p-5">
      <p className="technical-label text-subtle">{label}</p>
      <MoneyValue amount={amount} tone={tone} className="mt-3 block text-2xl font-semibold tracking-[-0.04em] sm:text-[1.7rem]" />
      {detail && <div className="mt-3 text-xs text-subtle">{detail}</div>}
    </section>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="panel p-4 sm:p-5" role="status" aria-label="กำลังโหลดข้อมูล">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1">
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="panel flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 grid size-10 place-items-center rounded-lg border border-line/70 bg-elevated text-subtle">
        —
      </div>
      <h2 className="font-medium text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-subtle">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="control mt-5 inline-flex items-center justify-center bg-foreground px-4 text-sm font-medium text-canvas"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({
  message = 'ไม่สามารถโหลดข้อมูลได้',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="panel border-expense/30 p-5" role="alert">
      <p className="font-medium text-foreground">{message}</p>
      <p className="mt-1 text-sm text-subtle">ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="control mt-4 px-4 text-sm">
          ลองใหม่
        </button>
      )}
    </div>
  );
}
