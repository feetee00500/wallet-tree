'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '@wallet-tree/shared';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PlusIcon, SearchIcon } from '@/components/icons';
import { MonthSelector, currentBangkokMonth } from '@/components/month-selector';
import { TransactionRow } from '@/components/transaction-row';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MoneyValue,
  PageHeader,
} from '@/components/ui';
import {
  deleteTransaction,
  getCategories,
  getTransactions,
} from '@/lib/client/finance';
import { formatThaiDate } from '@/lib/finance/format';
import { getBangkokMonthRange } from '@/lib/timezone/bangkok';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(currentBangkokMonth);
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => getCategories(signal),
  });

  const params = useMemo(() => {
    const range = getBangkokMonthRange(selectedMonth.year, selectedMonth.month);
    const value = new URLSearchParams({
      page: String(page),
      pageSize: '20',
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
    });
    if (search) value.set('search', search);
    if (type) value.set('type', type);
    if (categoryId) value.set('categoryId', categoryId);
    return value;
  }, [categoryId, page, search, selectedMonth, type]);

  const transactions = useQuery({
    queryKey: ['transactions', params.toString()],
    queryFn: ({ signal }) => getTransactions(params, signal),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: async () => {
      setPendingDelete(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['monthly-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-transactions'] }),
      ]);
    },
  });

  const groups = useMemo(() => {
    const value = new Map<string, Transaction[]>();
    for (const transaction of transactions.data?.data ?? []) {
      const key = formatThaiDate(transaction.transactionDate);
      value.set(key, [...(value.get(key) ?? []), transaction]);
    }
    return Array.from(value.entries());
  }, [transactions.data]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(draftSearch.trim());
  }

  function clearFilters() {
    setDraftSearch('');
    setSearch('');
    setType('');
    setCategoryId('');
    setPage(1);
  }

  const hasFilters = Boolean(search || type || categoryId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger / activity"
        title="ประวัติรายการ"
        description="ค้นหา กรอง และตรวจสอบทุกรายการตามลำดับเวลา"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector
              value={selectedMonth}
              onChange={(value) => {
                setSelectedMonth(value);
                setPage(1);
              }}
            />
            <Link
              href="/transactions/new"
              className="control inline-flex items-center gap-2 bg-foreground px-4 text-sm font-medium text-canvas"
            >
              <PlusIcon className="size-4" />
              เพิ่มรายการ
            </Link>
          </div>
        }
      />

      <section className="panel p-4">
        <form onSubmit={submitSearch} className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
          <label className="relative">
            <span className="sr-only">ค้นหารายการ</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="ค้นหารายละเอียดหรือหมวดหมู่"
              className="control w-full pl-10 pr-3 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">ประเภทรายการ</span>
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
              className="control w-full px-3 text-sm"
            >
              <option value="">ทุกประเภท</option>
              <option value="expense">รายจ่าย</option>
              <option value="income">รายรับ</option>
            </select>
          </label>
          <label>
            <span className="sr-only">หมวดหมู่</span>
            <select
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
              className="control w-full px-3 text-sm"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.data?.map((category) => (
                <option key={category._id} value={category._id}>{category.nameTh}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="control bg-muted px-5 text-sm font-medium">
            ค้นหา
          </button>
        </form>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 min-h-10 text-xs text-subtle hover:text-foreground hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </section>

      {transactions.isPending && <LoadingSkeleton rows={8} />}
      {transactions.isError && <ErrorState onRetry={() => transactions.refetch()} />}
      {transactions.data?.data.length === 0 && (
        <EmptyState
          title={hasFilters ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีรายการในเดือนนี้'}
          description={
            hasFilters
              ? 'ลองเปลี่ยนคำค้นหา ประเภท หรือหมวดหมู่'
              : 'เพิ่มรายรับหรือรายจ่ายเพื่อเริ่มสร้างประวัติทางการเงิน'
          }
          actionHref={hasFilters ? undefined : '/transactions/new'}
          actionLabel={hasFilters ? undefined : 'เพิ่มรายการ'}
        />
      )}

      {groups.map(([date, items]) => {
        const dailyNet = items.reduce(
          (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
          0
        );
        return (
          <section key={date} className="panel overflow-hidden">
            <header className="flex items-center justify-between border-b border-line/60 bg-elevated/60 px-4 py-3 sm:px-5">
              <h2 className="technical-label text-subtle">{date}</h2>
              <MoneyValue
                amount={dailyNet}
                tone={dailyNet >= 0 ? 'income' : 'expense'}
                className="text-xs font-medium"
              />
            </header>
            {items.map((transaction) => (
              <TransactionRow
                key={transaction._id}
                transaction={transaction}
                onDelete={setPendingDelete}
              />
            ))}
          </section>
        );
      })}

      {transactions.data && transactions.data.totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="หน้ารายการ">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className="control px-4 text-sm"
          >
            ก่อนหน้า
          </button>
          <span className="text-xs text-subtle">
            หน้า {page} จาก {transactions.data.totalPages} · {transactions.data.total} รายการ
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(transactions.data!.totalPages, value + 1))}
            disabled={page === transactions.data.totalPages}
            className="control px-4 text-sm"
          >
            ถัดไป
          </button>
        </nav>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="ลบรายการนี้?"
        description={`รายการ “${pendingDelete?.description ?? ''}” จะถูกลบถาวรและยอดสรุปจะคำนวณใหม่`}
        confirmLabel="ลบรายการ"
        busy={remove.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete._id)}
      />
    </div>
  );
}
