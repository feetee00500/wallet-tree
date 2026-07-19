import Link from 'next/link';
import type { Transaction } from '@wallet-tree/shared';
import { ArrowDownIcon, ArrowUpIcon, EditIcon, TrashIcon } from './icons';
import { MoneyValue } from './ui';
import { formatThaiDateTime } from '@/lib/finance/format';

export function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete?: (transaction: Transaction) => void;
}) {
  const income = transaction.type === 'income';
  const TypeIcon = income ? ArrowDownIcon : ArrowUpIcon;
  return (
    <article className="group grid min-h-16 grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line/55 px-4 py-3 last:border-b-0 sm:grid-cols-[32px_minmax(0,1fr)_auto_auto] sm:px-5">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded border ${
          income
            ? 'border-income/25 bg-income/10 text-income'
            : 'border-expense/25 bg-expense/10 text-expense'
        }`}
      >
        <TypeIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-sm font-medium">{transaction.description}</h3>
          <span className="hidden shrink-0 font-mono text-[10px] text-subtle sm:inline">
            {transaction.categoryName}
          </span>
        </div>
        <p className="mt-1 truncate font-mono text-[10px] text-subtle">
          {transaction.categoryName} · {formatThaiDateTime(transaction.transactionDate)}
        </p>
      </div>
      <MoneyValue
        amount={income ? transaction.amount : -transaction.amount}
        tone={income ? 'income' : 'expense'}
        className="max-w-32 truncate text-right text-xs font-semibold sm:max-w-none sm:text-sm"
      />
      {(onDelete || transaction._id) && (
        <div className="col-start-3 row-start-2 flex shrink-0 justify-end sm:col-start-auto sm:row-start-auto">
          <Link
            href={`/transactions/${transaction._id}/edit`}
            className="grid size-10 place-items-center rounded-md text-subtle hover:bg-muted hover:text-foreground"
            aria-label={`แก้ไข ${transaction.description}`}
          >
            <EditIcon className="size-4" />
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="grid size-10 place-items-center rounded-md text-subtle hover:bg-expense/10 hover:text-expense"
              aria-label={`ลบ ${transaction.description}`}
            >
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
