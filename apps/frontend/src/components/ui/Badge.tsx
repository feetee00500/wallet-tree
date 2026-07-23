import type { ReactNode } from 'react';

type BadgeTone = 'income' | 'expense' | 'neutral' | 'info' | 'warning' | 'danger' | 'success';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const toneClass: Record<BadgeTone, string> = {
  income: 'text-cyan-deep bg-cyan-soft',
  expense: 'text-error-deep bg-error-soft',
  neutral: 'text-body bg-canvas-soft-2',
  info: 'text-link bg-link-bg-soft',
  warning: 'text-warning-deep bg-warning-soft',
  danger: 'text-error-deep bg-error-soft',
  success: 'text-link bg-link-bg-soft',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[8px] py-[2px] text-caption font-medium leading-[18px] ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
