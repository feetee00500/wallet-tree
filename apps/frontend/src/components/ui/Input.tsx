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
    ? 'border-alarm-red/60 focus:border-alarm-red'
    : 'border-graphite-hairline focus:border-iris-violet';
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-body-sm font-medium text-bone-white">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`min-h-[36px] w-full rounded-[6px] border bg-void-black px-3 text-body-sm text-white placeholder:text-iron transition outline-none focus:ring-2 focus:ring-iris-violet/20 ${borderClass} ${className}`}
        {...rest}
      />
      {error ? <span className="text-caption text-alarm-red">{error}</span> : null}
    </div>
  );
});
