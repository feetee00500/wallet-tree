import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  tone?: 'income' | 'expense' | 'neutral';
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  ariaLabel?: string;
}

const sizeClass = {
  sm: 'min-h-[32px] text-caption',
  md: 'min-h-[36px] text-body-sm',
};

const toneActive = {
  income: 'text-pulse-green',
  expense: 'text-alarm-red',
  neutral: 'text-iris-violet',
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  disabled = false,
  size = 'md',
  fullWidth = true,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <span className="text-body-sm font-medium text-bone-white">{label}</span> : null}
      <div
        role="tablist"
        aria-label={ariaLabel ?? label}
        className={`inline-flex items-center gap-0 rounded-[6px] border border-graphite-hairline bg-void-black p-0 ${
          fullWidth ? 'w-full' : ''
        }`}
      >
        {options.map((option) => {
          const isActive = option.value === value;
          const tone = option.tone ?? 'neutral';
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-[6px] px-3 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                sizeClass[size]
              } ${
                isActive
                  ? `bg-charcoal/30 text-white ring-1 ring-inset ring-graphite-hairline ${toneActive[tone]}`
                  : 'text-ash-gray hover:text-bone-white'
              }`}
            >
              {option.icon ? <span className="flex shrink-0 items-center">{option.icon}</span> : null}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
