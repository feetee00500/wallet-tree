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
      <label htmlFor={inputId} className="text-body-sm font-medium text-bone-white">
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[36px] w-full rounded-[6px] border bg-void-black px-3 text-body-sm text-white transition outline-none focus:ring-2 focus:ring-iris-violet/20 ${
          error ? 'border-alarm-red/60' : 'border-graphite-hairline focus:border-iris-violet'
        }`}
      />
      {error ? <span className="text-caption text-alarm-red">{error}</span> : null}
    </div>
  );
}
