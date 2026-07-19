'use client';

import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { formatThaiMonth } from '@/lib/finance/format';

export type SelectedMonth = { year: number; month: number };

export function currentBangkokMonth(): SelectedMonth {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date());
  return {
    year: Number(parts.find(({ type }) => type === 'year')?.value),
    month: Number(parts.find(({ type }) => type === 'month')?.value),
  };
}

function shiftMonth(value: SelectedMonth, offset: number): SelectedMonth {
  const date = new Date(Date.UTC(value.year, value.month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function MonthSelector({
  value,
  onChange,
}: {
  value: SelectedMonth;
  onChange: (value: SelectedMonth) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line/70 bg-surface p-1">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        className="grid size-9 place-items-center rounded-md text-subtle duration-ui ease-ui hover:bg-muted hover:text-foreground"
        aria-label="เดือนก่อนหน้า"
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      <span className="min-w-36 px-2 text-center text-sm font-medium">
        {formatThaiMonth(value.year, value.month)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        className="grid size-9 place-items-center rounded-md text-subtle duration-ui ease-ui hover:bg-muted hover:text-foreground"
        aria-label="เดือนถัดไป"
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}
