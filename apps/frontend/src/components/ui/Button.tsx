import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-signal-blue text-white hover:bg-sky-blue focus-visible:ring-signal-blue/50 disabled:bg-signal-blue/30 disabled:text-ash-gray',
  secondary:
    'border border-graphite-hairline bg-transparent text-bone-white hover:border-white focus-visible:ring-iris-violet/50 disabled:border-graphite-hairline/50 disabled:text-ash-gray',
  ghost:
    'bg-transparent text-ash-gray hover:text-bone-white focus-visible:ring-iris-violet/30',
  outline:
    'border border-graphite-hairline bg-transparent text-bone-white hover:border-white focus-visible:ring-iris-violet/50',
  danger:
    'border border-graphite-hairline bg-transparent text-alarm-red hover:border-alarm-red hover:text-crimson focus-visible:ring-alarm-red/50 disabled:border-graphite-hairline/50 disabled:text-ash-gray',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-[32px] px-3 text-body-sm',
  md: 'min-h-[36px] px-4 text-body-sm',
  lg: 'min-h-[40px] px-5 text-body-sm',
};

export function Button({
  variant = 'secondary',
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
      className={`inline-flex items-center justify-center rounded-[6px] font-medium transition duration-100 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
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
