import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-on-primary hover:bg-ink/90 focus-visible:ring-link/50 disabled:bg-ink/30 disabled:text-mute',
  secondary:
    'bg-canvas text-ink border border-hairline hover:border-hairline-strong hover:bg-canvas-soft focus-visible:ring-link/50 disabled:opacity-50',
  ghost:
    'bg-transparent text-body hover:text-ink focus-visible:ring-link/30',
  danger:
    'bg-canvas text-error border border-hairline hover:border-error hover:bg-error-soft/30 focus-visible:ring-error/30 disabled:opacity-50',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-[32px] px-3 text-body-sm font-medium',
  md: 'min-h-[40px] px-4 text-body-sm font-medium',
  lg: 'min-h-[48px] px-5 text-button-lg font-medium',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center rounded-[6px] transition duration-100 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
