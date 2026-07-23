import type { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'muted' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  default: 'bg-void-black border-graphite-hairline',
  muted: 'bg-void-black border-graphite-hairline/60',
  elevated: 'bg-surface-gradient border-graphite-hairline',
};

export function Card({
  variant = 'default',
  interactive = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-[16px] border ${variantClass[variant]} ${
        interactive ? 'transition hover:border-white' : ''
      } ${className}`}
      {...rest}
    />
  );
}
