interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  value: string;
  options: SegmentedControlOption[];
  onChange: (value: string) => void;
}

export function SegmentedControl({ value, options, onChange }: SegmentedControlProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-[6px] border border-hairline bg-canvas-soft-2 p-[2px]">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[4px] px-3 py-1.5 text-body-sm font-medium transition ${
              selected
                ? 'bg-canvas text-ink shadow-[var(--shadow-level-2)]'
                : 'text-body hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
