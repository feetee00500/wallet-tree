interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition ${
          checked ? 'border-link bg-link' : 'border-hairline bg-canvas-soft-2'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-link/50`}
      >
        <span
          className={`inline-block h-4 w-4 translate-y-[1.5px] rounded-full bg-white shadow-[var(--shadow-level-2)] transition ${
            checked ? 'translate-x-[16px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
      {label ? <span className="text-body-sm text-body">{label}</span> : null}
    </label>
  );
}
