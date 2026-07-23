import type { CategoryResponse, TransactionResponse } from '@wallet-tree/shared';
import { TransactionType } from '@wallet-tree/shared';
import { Badge } from './ui/Badge';
import { IconButton } from './ui/IconButton';
import { PencilIcon, TrashIcon } from './icons';
import { formatCurrency, formatDate } from '../lib/format';

interface TransactionsTableProps {
  transactions: TransactionResponse[];
  categories: Map<string, CategoryResponse>;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (transaction: TransactionResponse) => void;
}

export function TransactionsTable({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[6px] border border-hairline bg-canvas shadow-[var(--shadow-level-2)] sm:block">
        <table className="w-full text-[13px]">
          <thead className="bg-canvas/80 text-left text-[11px] font-semibold uppercase tracking-wide text-mute">
            <tr>
              <th className="px-4 py-2.5 font-medium">วันที่</th>
              <th className="px-4 py-3 font-medium">รายละเอียด</th>
              <th className="px-4 py-3 font-medium">หมวดหมู่</th>
              <th className="px-4 py-3 font-medium">ประเภท</th>
              <th className="px-4 py-3 text-right font-medium">จำนวนเงิน</th>
              <th className="px-4 py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {transactions.map((transaction) => {
              const category = categories.get(transaction.categoryId);
              const isIncome = transaction.type === TransactionType.INCOME;
              const description = transaction.description?.trim() || category?.name || 'ไม่ระบุ';
              return (
                <tr key={transaction.id} className="text-ink transition hover:bg-canvas-soft-2/30">
                  <td className="whitespace-nowrap px-4 py-3 text-mute">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-4 py-3">{description}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-body">
                      <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-canvas-soft-2 text-[11px]">
                        {category?.icon ?? '•'}
                      </span>
                      {category?.name ?? 'ไม่ระบุ'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={isIncome ? 'income' : 'expense'}>
                      {isIncome ? 'รายรับ' : 'รายจ่าย'}
                    </Badge>
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                      isIncome ? 'text-cyan-deep' : 'text-error-deep'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <IconButton
                        icon={PencilIcon}
                        label="แก้ไข"
                        onClick={() => onEdit(transaction)}
                      />
                      <IconButton
                        icon={TrashIcon}
                        tone="danger"
                        label="ลบ"
                        onClick={() => onDelete(transaction)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 sm:hidden">
        {transactions.map((transaction) => {
          const category = categories.get(transaction.categoryId);
          const isIncome = transaction.type === TransactionType.INCOME;
          const description = transaction.description?.trim() || category?.name || 'ไม่ระบุ';
          return (
            <li
              key={transaction.id}
              className="rounded-[6px] border border-hairline bg-canvas px-4 py-3 shadow-[var(--shadow-level-2)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-canvas-soft-2 text-base">
                    {category?.icon ?? '•'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">{description}</p>
                    <p className="truncate text-[11px] text-mute">
                      {(category?.name ?? 'ไม่ระบุ')} · {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[13px] font-semibold tabular-nums ${
                    isIncome ? 'text-cyan-deep' : 'text-error-deep'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={isIncome ? 'income' : 'expense'}>
                  {isIncome ? 'รายรับ' : 'รายจ่าย'}
                </Badge>
                <div className="flex gap-1">
                  <IconButton
                    icon={PencilIcon}
                    label="แก้ไข"
                    onClick={() => onEdit(transaction)}
                  />
                  <IconButton
                    icon={TrashIcon}
                    tone="danger"
                    label="ลบ"
                    onClick={() => onDelete(transaction)}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
