'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LazyCashFlowChart } from '@/components/lazy-cash-flow-chart';
import { MonthSelector, currentBangkokMonth } from '@/components/month-selector';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MetricCard,
  MoneyValue,
  PageHeader,
} from '@/components/ui';
import { getMonthlySummary } from '@/lib/client/finance';
import { formatSatang, percentageChange } from '@/lib/finance/format';

export default function MonthlySummaryPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentBangkokMonth);
  const summary = useQuery({
    queryKey: ['monthly-summary', selectedMonth],
    queryFn: () => getMonthlySummary(selectedMonth.year, selectedMonth.month),
  });

  const header = (
    <PageHeader
      eyebrow="Analytics / monthly"
      title="วิเคราะห์รายเดือน"
      description="เปรียบเทียบกระแสเงินสด รูปแบบรายวัน และสัดส่วนตามหมวดหมู่"
      action={<MonthSelector value={selectedMonth} onChange={setSelectedMonth} />}
    />
  );

  if (summary.isPending) return <div className="space-y-6">{header}<LoadingSkeleton rows={7} /></div>;
  if (summary.isError) return <div className="space-y-6">{header}<ErrorState onRetry={() => summary.refetch()} /></div>;
  const data = summary.data;
  if (data.transactionCount === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          title="ยังไม่มีข้อมูลสำหรับวิเคราะห์"
          description="บันทึกรายการของเดือนนี้ก่อน แล้วรายงานจะคำนวณให้อัตโนมัติ"
          actionHref="/transactions/new"
          actionLabel="เพิ่มรายการ"
        />
      </div>
    );
  }

  const previousExpense = data.previousMonth?.expenses ?? 0;
  const expenseChange = percentageChange(data.expenses, previousExpense);

  return (
    <div className="space-y-6">
      {header}
      <div className="panel grid gap-px overflow-hidden bg-line/60 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="กระแสเงินสดสุทธิ" amount={data.net} />
        <MetricCard label="รายจ่ายเฉลี่ยต่อวัน" amount={data.averageDailyExpense} tone="expense" />
        <MetricCard label="รายจ่ายสูงสุด" amount={data.highestExpense} tone="expense" />
        <section className="bg-surface p-4 sm:p-5">
          <p className="technical-label text-subtle">เทียบเดือนก่อน</p>
          <p className={`money mt-3 text-2xl font-semibold ${
            expenseChange !== null && expenseChange <= 0 ? 'text-income' : 'text-expense'
          }`}>
            {expenseChange === null ? '—' : `${expenseChange > 0 ? '+' : ''}${expenseChange}%`}
          </p>
          <p className="mt-3 text-xs text-subtle">การเปลี่ยนแปลงของรายจ่าย</p>
        </section>
      </div>

      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-medium">รูปแบบรายวัน</h2>
            <p className="mt-1 text-xs text-subtle">รายรับและรายจ่ายตั้งแต่วันที่ 1 ถึงสิ้นเดือน</p>
          </div>
          <div className="text-right text-xs text-subtle">
            <p>อัตราเงินเหลือ</p>
            <p className="money mt-1 text-base font-medium text-foreground">
              {data.savingsRate === null ? '—' : `${data.savingsRate}%`}
            </p>
          </div>
        </div>
        <div className="mt-4"><LazyCashFlowChart data={data.dailyTrend} /></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: 'รายจ่ายตามหมวดหมู่', categories: data.expenseByCategory, tone: 'expense' as const },
          { title: 'รายรับตามหมวดหมู่', categories: data.incomeByCategory, tone: 'income' as const },
        ].map(({ title, categories, tone }) => (
          <section key={title} className="panel p-4 sm:p-5">
            <h2 className="font-medium">{title}</h2>
            <p className="mt-1 text-xs text-subtle">เรียงจากยอดรวมสูงสุด</p>
            {categories.length === 0 ? (
              <p className="mt-8 text-sm text-subtle">ไม่มีข้อมูลในกลุ่มนี้</p>
            ) : (
              <div className="mt-6 space-y-5">
                {categories.slice(0, 8).map((category) => (
                  <div key={category.categoryName}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate">{category.categoryName}</span>
                      <div className="shrink-0 text-right">
                        <MoneyValue amount={category.amount} tone={tone} className="text-sm font-medium" />
                        <span className="ml-2 text-[10px] text-subtle">{category.percentage}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${tone === 'income' ? 'bg-income' : 'bg-expense'}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="panel grid gap-px overflow-hidden bg-line/40 sm:grid-cols-3">
        <div className="bg-surface p-5">
          <p className="text-xs text-subtle">วันที่ใช้จ่ายสูงสุด</p>
          <p className="mt-2 text-lg font-medium">
            {data.highestSpendingDay ? `วันที่ ${data.highestSpendingDay.day}` : '—'}
          </p>
          {data.highestSpendingDay && (
            <p className="money mt-1 text-xs text-expense">
              {formatSatang(data.highestSpendingDay.amount)}
            </p>
          )}
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs text-subtle">อัตรารายจ่ายต่อรายรับ</p>
          <p className="money mt-2 text-lg font-medium">
            {data.income > 0 ? `${Math.round((data.expenses / data.income) * 100)}%` : '—'}
          </p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs text-subtle">จำนวนรายการ</p>
          <p className="money mt-2 text-lg font-medium">{data.transactionCount.toLocaleString('th-TH')}</p>
        </div>
      </section>
    </div>
  );
}
