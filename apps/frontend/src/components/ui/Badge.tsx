import type { ReactNode } from 'react';

type BadgeTone = 'income' | 'expense' | 'neutral' | 'info' | 'warning' | 'danger' | 'success';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const toneClass: Record<BadgeTone, string> = {
  income: 'text-pulse-green bg-pulse-green/10 ring-1 ring-inset ring-pulse-green/20',
  expense: 'text-alarm-red bg-alarm-red/10 ring-1 ring-inset ring-alarm-red/20',
  neutral: 'text-ash-gray bg-charcoal/30 ring-1 ring-inset ring-graphite-hairline',
  info: 'text-sky-blue bg-sky-blue/10 ring-1 ring-inset ring-sky-blue/20',
  warning: 'text-amber bg-amber/10 ring-1 ring-inset ring-amber/20',
  danger: 'text-alarm-red bg-alarm-red/10 ring-1 ring-inset ring-alarm-red/20',
  success: 'text-pulse-green bg-pulse-green/10 ring-1 ring-inset ring-pulse-green/20',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[6px] px-[6px] py-[2px] text-caption font-mono font-medium leading-[18px] ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
