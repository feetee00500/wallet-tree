import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type IconButtonTone = 'neutral' | 'danger' | 'accent';
type IconButtonSize = 'sm' | 'md';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: IconButtonTone;
  size?: IconButtonSize;
  label: string;
  children: ReactNode;
}

const sizeClass: Record<IconButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
};

const toneClass: Record<IconButtonTone, string> = {
  neutral: 'text-ash-gray hover:bg-charcoal/30 hover:text-bone-white',
  danger: 'text-ash-gray hover:bg-alarm-red/10 hover:text-alarm-red',
  accent: 'text-ash-gray hover:bg-iris-violet/10 hover:text-iris-violet',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { tone = 'neutral', size = 'md', label, className = '', children, type = 'button', ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={`inline-flex shrink-0 items-center justify-center rounded-[6px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass[size]} ${toneClass[tone]} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
