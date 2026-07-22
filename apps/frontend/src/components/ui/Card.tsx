import type { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'muted' | 'subtle';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  default: 'bg-zinc-900 border-zinc-700',
  muted: 'bg-zinc-900/85 border-zinc-700',
  subtle: 'bg-zinc-900/60 border-zinc-800',
};

export function Card({
  variant = 'default',
  interactive = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-md border shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${variantClass[variant]} ${
        interactive ? 'transition hover:border-zinc-600 hover:bg-zinc-800/80' : ''
      } ${className}`}
      {...rest}
    />
  );
}
