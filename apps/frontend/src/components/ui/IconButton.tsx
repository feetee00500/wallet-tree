import type { ButtonHTMLAttributes, ComponentType, SVGProps } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  tone?: 'default' | 'danger';
}

export function IconButton({
  icon: Icon,
  label,
  tone = 'default',
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas text-body transition hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-link/50 ${
        tone === 'danger' ? 'hover:text-error hover:border-error' : ''
      } ${className}`}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
