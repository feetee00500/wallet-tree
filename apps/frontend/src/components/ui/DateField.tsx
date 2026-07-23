interface DateFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  id?: string;
  name?: string;
}

export function DateField({ label, value, onChange, error, id, name }: DateFieldProps) {
  const inputId = id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-body-sm font-medium text-body">
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[40px] w-full rounded-[6px] border bg-canvas px-3 text-body-sm text-ink transition outline-none focus:shadow-[var(--shadow-inset-hairline)] ${
          error ? 'border-error/60 focus:border-error' : 'border-hairline focus:border-link'
        }`}
      />
      {error ? <span className="text-caption text-error">{error}</span> : null}
    </div>
  );
}
