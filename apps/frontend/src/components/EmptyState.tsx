import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, className = '', children }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[6px] border border-dashed border-hairline bg-canvas/40 px-4 py-10 text-center ${className}`}
    >
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 text-[13px] text-mute">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
