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
  const borderClass = error ? 'border-rose-500/60' : 'border-zinc-700 focus:border-cyan-400/70';
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`min-h-[44px] w-full rounded-md border bg-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition outline-none focus:ring-2 focus:ring-cyan-400/30 ${borderClass} ${className}`}
        {...rest}
      />
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </div>
  );
});
