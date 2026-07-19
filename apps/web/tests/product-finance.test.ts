import { describe, expect, it } from 'vitest';
import {
  bangkokDateTimeInput,
  formatSatang,
  percentageChange,
  satangFromInput,
  toIsoFromBangkokInput,
} from '@/lib/finance/format';
import { getDisciplineInsight, rankCategories } from '@/lib/finance/summary';
import {
  getBangkokDateKey,
  getBangkokDayOfMonth,
  getBangkokMonthRange,
} from '@/lib/timezone/bangkok';
import type { MonthlySummary } from '@wallet-tree/shared';
import { cashFlowTextSummary } from '@/components/lazy-cash-flow-chart';
import { isNavigationActive } from '@/components/app-shell';

const summary = {
  year: 2026,
  month: 7,
  income: 5_000_000,
  expenses: 3_000_000,
  net: 2_000_000,
  transactionCount: 4,
  averageDailyExpense: 96_774,
  highestExpense: 1_500_000,
  expenseByCategory: [
    { categoryName: 'เดินทาง', amount: 1_000_000, percentage: 33 },
    { categoryName: 'อาหาร', amount: 2_000_000, percentage: 67 },
  ],
  incomeByCategory: [
    { categoryName: 'เงินเดือน', amount: 5_000_000, percentage: 100 },
  ],
  dailyTrend: [],
  highestSpendingDay: { day: 2, amount: 1_500_000 },
  savingsRate: 40,
  previousMonth: { income: 4_000_000, expenses: 3_500_000, net: 500_000 },
} satisfies MonthlySummary;

describe('financial formatting and calculations', () => {
  it('converts decimal baht input to integer satang', () => {
    expect(satangFromInput('1250.50')).toBe(125_050);
    expect(satangFromInput('0.01')).toBe(1);
    expect(satangFromInput('invalid')).toBe(0);
  });

  it('formats THB consistently for positive, negative, and decimal values', () => {
    expect(formatSatang(125_000)).toContain('1,250');
    expect(formatSatang(-125_000)).toContain('1,250');
    expect(formatSatang(125_050)).toContain('1,250.50');
    expect(formatSatang(987_654_321_00)).toContain('987,654,321');
  });

  it('keeps a text alternative available independently from the lazy chart', () => {
    const text = cashFlowTextSummary([
      { day: 1, income: 500_000, expenses: 0 },
      { day: 2, income: 0, expenses: 125_000 },
    ]);
    expect(text).toContain('2 วัน');
    expect(text).toContain('5,000');
    expect(text).toContain('1,250');
    expect(cashFlowTextSummary([])).toContain('ยังไม่มีข้อมูล');
  });

  it('marks exact and nested mobile navigation routes active', () => {
    expect(isNavigationActive('/transactions', '/transactions')).toBe(true);
    expect(isNavigationActive('/transactions/new', '/transactions')).toBe(true);
    expect(isNavigationActive('/monthly-summary', '/transactions')).toBe(false);
  });

  it('computes comparisons without misleading division by zero', () => {
    expect(percentageChange(120, 100)).toBe(20);
    expect(percentageChange(80, 100)).toBe(-20);
    expect(percentageChange(0, 0)).toBe(0);
    expect(percentageChange(100, 0)).toBeNull();
  });

  it('ranks categories and derives deterministic discipline insight', () => {
    expect(rankCategories(summary)[0].categoryName).toBe('อาหาร');
    expect(getDisciplineInsight(summary)).toContain('40%');
    expect(
      getDisciplineInsight({ ...summary, transactionCount: 0 })
    ).toContain('รายการแรก');
  });
});

describe('Asia/Bangkok boundaries', () => {
  it('builds a month range from Bangkok midnight', () => {
    const range = getBangkokMonthRange(2026, 7);
    expect(range.start.toISOString()).toBe('2026-06-30T17:00:00.000Z');
    expect(range.end.toISOString()).toBe('2026-07-31T16:59:59.999Z');
  });

  it('maps UTC instants to the correct Bangkok day and date', () => {
    const instant = new Date('2026-06-30T18:30:00.000Z');
    expect(getBangkokDayOfMonth(instant)).toBe(1);
    expect(getBangkokDateKey(instant)).toBe('2026-07-01');
  });

  it('converts datetime-local values without changing Bangkok wall time', () => {
    expect(toIsoFromBangkokInput('2026-07-19T09:30')).toBe(
      '2026-07-19T02:30:00.000Z'
    );
    expect(bangkokDateTimeInput(new Date('2026-07-19T02:30:00.000Z'))).toBe(
      '2026-07-19T09:30'
    );
  });
});
