import type { CategoryResponse, TransactionResponse } from '@wallet-tree/shared';
import { TransactionType } from '@wallet-tree/shared';
import { formatCurrency, formatDate } from '../lib/format';

interface TransactionListItemProps {
  transaction: TransactionResponse;
  category: CategoryResponse | undefined;
}

export function TransactionListItem({ transaction, category }: TransactionListItemProps) {
  const isIncome = transaction.type === TransactionType.INCOME;
  const amountClass = isIncome ? 'text-emerald-400' : 'text-orange-400';
  const sign = isIncome ? '+' : '-';
  const title = transaction.description?.trim() || category?.name || 'ไม่ระบุ';

  return (
    <li className="flex min-h-11 items-center justify-between gap-3 border-b border-zinc-800 py-2 last:border-b-0 hover:bg-zinc-800/20">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-zinc-700 bg-zinc-800 text-sm">
          {category?.icon ?? '•'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-zinc-100">{title}</p>
          <p className="truncate text-[11px] text-zinc-500">
            {(category?.name ?? 'ไม่ระบุหมวดหมู่')} · {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      <span className={`shrink-0 font-medium tabular-nums ${amountClass}`}>
        {sign}
        {formatCurrency(transaction.amount)}
      </span>
    </li>
  );
}
