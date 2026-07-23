import type { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'soft' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  default: 'bg-canvas border-hairline shadow-[var(--shadow-level-3)]',
  soft: 'bg-canvas-soft border-hairline',
  elevated: 'bg-canvas border-hairline shadow-[var(--shadow-level-4)]',
};

export function Card({
  variant = 'default',
  interactive = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-[12px] border ${variantClass[variant]} ${
        interactive ? 'transition hover:shadow-[var(--shadow-level-4)]' : ''
      } ${className}`}
      {...rest}
    />
  );
}
