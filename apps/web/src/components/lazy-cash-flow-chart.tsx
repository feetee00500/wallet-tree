'use client';

import dynamic from 'next/dynamic';
import { formatSatang } from '@/lib/finance/format';

type Point = { day: number; income: number; expenses: number };

const CashFlowChart = dynamic(
  () => import('./cash-flow-chart').then((module) => module.CashFlowChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-64 animate-pulse rounded-md bg-muted/45"
        role="status"
        aria-label="กำลังโหลดกราฟ"
      />
    ),
  }
);

export function cashFlowTextSummary(data: Point[]) {
  const activeDays = data.filter(
    (point) => point.income > 0 || point.expenses > 0
  ).length;
  const income = data.reduce((sum, point) => sum + point.income, 0);
  const expenses = data.reduce((sum, point) => sum + point.expenses, 0);

  if (activeDays === 0) {
    return 'ยังไม่มีข้อมูลเพียงพอสำหรับกราฟเดือนนี้';
  }

  return `เดือนนี้มีข้อมูลเคลื่อนไหว ${activeDays} วัน รายรับรวม ${formatSatang(
    income
  )} และรายจ่ายรวม ${formatSatang(expenses)}`;
}

export function LazyCashFlowChart({ data }: { data: Point[] }) {
  return (
    <div>
      <p className="sr-only">{cashFlowTextSummary(data)}</p>
      <CashFlowChart data={data} />
    </div>
  );
}
