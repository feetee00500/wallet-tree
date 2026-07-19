'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MonthlySummary, PaginatedResponse, Transaction } from '@wallet-tree/shared';
import { LazyCashFlowChart } from '@/components/lazy-cash-flow-chart';
import { MonthSelector, currentBangkokMonth } from '@/components/month-selector';
import { PlusIcon } from '@/components/icons';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MetricCard,
  MoneyValue,
  PageHeader,
} from '@/components/ui';
import { TransactionRow } from '@/components/transaction-row';
import { getMonthlySummary, getTransactions } from '@/lib/client/finance';
import { getDisciplineInsight, rankCategories } from '@/lib/finance/summary';
import { percentageChange } from '@/lib/finance/format';

function Comparison({ value, inverse = false }: { value: number | null; inverse?: boolean }) {
  if (value === null) return <span>ยังไม่มีฐานเปรียบเทียบ</span>;
  const favorable = inverse ? value <= 0 : value >= 0;
  return (
    <span className={favorable ? 'text-income' : 'text-expense'}>
      {value > 0 ? '+' : ''}{value}% จากเดือนก่อน
    </span>
  );
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentBangkokMonth);
  const summary = useQuery<MonthlySummary>({
    queryKey: ['monthly-summary', selectedMonth],
    queryFn: () => getMonthlySummary(selectedMonth.year, selectedMonth.month),
  });
  const recent = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['recent-transactions'],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '6' });
      return getTransactions(params);
    },
  });

  const header = (
    <PageHeader
      eyebrow="Overview / monthly"
      title="ภาพรวมการเงิน"
      description="กระแสเงินสด ผลลัพธ์สุทธิ และหมวดที่ใช้เงินสูงสุดในเดือนเดียว"
      action={
        <div className="flex flex-wrap items-center gap-3">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
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
  );

  if (summary.isPending) {
    return <div className="space-y-6">{header}<LoadingSkeleton rows={6} /></div>;
  }
  if (summary.isError) {
    return <div className="space-y-6">{header}<ErrorState onRetry={() => summary.refetch()} /></div>;
  }

  const data = summary.data;
  if (data.transactionCount === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          title="เดือนนี้ยังไม่มีรายการ"
          description="เพิ่มรายรับหรือรายจ่ายรายการแรก แล้วภาพรวมจะคำนวณให้ทันที"
          actionHref="/transactions/new"
          actionLabel="เพิ่มรายการแรก"
        />
      </div>
    );
  }

  const expenseChange = percentageChange(data.expenses, data.previousMonth?.expenses ?? 0);
  const incomeChange = percentageChange(data.income, data.previousMonth?.income ?? 0);
  const categories = rankCategories(data).slice(0, 5);

  return (
    <div className="space-y-6">
      {header}

      <div className="panel grid gap-px overflow-hidden bg-line/60 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="เงินคงเหลือสุทธิ" amount={data.net} detail={`จาก ${data.transactionCount} รายการ`} />
        <MetricCard label="รายรับเดือนนี้" amount={data.income} tone="income" detail={<Comparison value={incomeChange} />} />
        <MetricCard label="รายจ่ายเดือนนี้" amount={data.expenses} tone="expense" detail={<Comparison value={expenseChange} inverse />} />
        <MetricCard
          label="รายจ่ายเฉลี่ยต่อวัน"
          amount={data.averageDailyExpense}
          tone="expense"
          detail={
            data.savingsRate === null
              ? 'ต้องมีข้อมูลรายรับก่อน'
              : `เงินเหลือ ${data.savingsRate}% ของรายรับ`
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <section className="panel min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-medium">รายรับเทียบรายจ่าย</h2>
              <p className="mt-1 text-xs text-subtle">ยอดรายวันตามเวลา Asia/Bangkok</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-income" />รายรับ</span>
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-expense" />รายจ่าย</span>
            </div>
          </div>
          <div className="mt-4"><LazyCashFlowChart data={data.dailyTrend} /></div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">หมวดที่ใช้จ่ายสูง</h2>
              <p className="mt-1 text-xs text-subtle">เรียงตามยอดรวมเดือนนี้</p>
            </div>
            <Link href="/monthly-summary" className="text-xs text-accent hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="mt-5 space-y-5">
            {categories.map((category, index) => (
              <div key={category.categoryName}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate"><span className="mr-2 text-xs text-subtle">0{index + 1}</span>{category.categoryName}</span>
                  <MoneyValue amount={category.amount} className="text-sm" />
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${category.percentage}%` }} />
                </div>
                <p className="mt-1 text-right text-[10px] text-subtle">{category.percentage}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel border-accent/25 bg-accent/[0.06] p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Discipline signal</p>
        <p className="mt-2 text-sm leading-6 text-foreground">{getDisciplineInsight(data)}</p>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line/50 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-medium">รายการล่าสุด</h2>
            <p className="mt-1 text-xs text-subtle">ความเคลื่อนไหวล่าสุดจากทุกช่องทาง</p>
          </div>
          <Link href="/transactions" className="text-xs text-accent hover:underline">ดูประวัติ</Link>
        </div>
        {recent.isPending && <div className="p-4"><LoadingSkeleton rows={3} /></div>}
        {recent.isError && <div className="p-4"><ErrorState onRetry={() => recent.refetch()} /></div>}
        {recent.data?.data.map((transaction) => (
          <TransactionRow key={transaction._id} transaction={transaction} />
        ))}
      </section>
    </div>
  );
}
