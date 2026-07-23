interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full border px-[3px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? 'border-iris-violet/40 bg-iris-violet/20'
          : 'border-graphite-hairline bg-void-black'
      }`}
    >
      <span
        className={`h-[14px] w-[14px] rounded-full transition-transform duration-200 ${
          checked ? 'translate-x-4 bg-iris-violet' : 'translate-x-0 bg-ash-gray'
        }`}
      />
    </button>
  );
}
