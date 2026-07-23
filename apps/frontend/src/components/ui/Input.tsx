import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const borderClass = error
    ? 'border-error/60 focus:border-error'
    : 'border-hairline focus:border-link';
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-body-sm font-medium text-body">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`min-h-[40px] w-full rounded-[6px] border bg-canvas px-3 text-body-sm text-ink placeholder:text-mute transition outline-none focus:shadow-[var(--shadow-inset-hairline)] ${borderClass} ${className}`}
        {...rest}
      />
      {error ? <span className="text-caption text-error">{error}</span> : null}
    </div>
  );
});
