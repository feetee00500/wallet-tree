import { TransactionType } from '@wallet-tree/shared';
import { SegmentedControl } from './ui/SegmentedControl';

interface TypeToggleProps {
  value: TransactionType;
  onChange: (next: TransactionType) => void;
  disabled?: boolean;
  label?: string;
}

const options = [
  { value: TransactionType.EXPENSE, label: 'รายจ่าย' },
  { value: TransactionType.INCOME, label: 'รายรับ' },
];

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={(next) => onChange(next as TransactionType)}
      options={options}
    />
  );
}
