import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getTransactionsCollection } from '@/lib/db/models';
import {
  getBangkokDayOfMonth,
  getCurrentBangkokMonth,
  getBangkokMonthRange,
} from '@/lib/timezone/bangkok';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const currentMonth = getCurrentBangkokMonth();
  const year = parseInt(searchParams.get('year') || String(currentMonth.year));
  const month = parseInt(searchParams.get('month') || String(currentMonth.month));

  const { start: startOfMonth, end: endOfMonth } =
    getBangkokMonthRange(year, month);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const { start: startOfPrevMonth, end: endOfPrevMonth } =
    getBangkokMonthRange(prevYear, prevMonth);

  const transactions = await getTransactionsCollection();

  const currentDocs = await transactions
    .find({
      userId: auth.userId,
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
    })
    .toArray();

  const prevDocs = await transactions
    .find({
      userId: auth.userId,
      transactionDate: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
    })
    .toArray();

  const income = currentDocs.filter((d) => d.type === 'income').reduce((s, d) => s + d.amount, 0);
  const expenses = currentDocs.filter((d) => d.type === 'expense').reduce((s, d) => s + d.amount, 0);

  const prevIncome = prevDocs.filter((d) => d.type === 'income').reduce((s, d) => s + d.amount, 0);
  const prevExpenses = prevDocs.filter((d) => d.type === 'expense').reduce((s, d) => s + d.amount, 0);

  const expenseDocs = currentDocs.filter((d) => d.type === 'expense');
  const totalExpenseAmount = expenseDocs.reduce((s, d) => s + d.amount, 0);

  const categoryMap = new Map<string, number>();
  expenseDocs.forEach((d) => {
    categoryMap.set(d.categoryName, (categoryMap.get(d.categoryName) || 0) + d.amount);
  });

  const expenseByCategory = Array.from(categoryMap.entries())
    .map(([categoryName, amount]) => ({
      categoryName,
      amount,
      percentage: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const daysInMonth = new Date(year, month, 0).getDate();
  const incomeDocs = currentDocs.filter((d) => d.type === 'income');
  const incomeCategoryMap = new Map<string, number>();
  incomeDocs.forEach((d) => {
    incomeCategoryMap.set(
      d.categoryName,
      (incomeCategoryMap.get(d.categoryName) || 0) + d.amount
    );
  });
  const incomeByCategory = Array.from(incomeCategoryMap.entries())
    .map(([categoryName, amount]) => ({
      categoryName,
      amount,
      percentage: income > 0 ? Math.round((amount / income) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const dailyTrend = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    income: 0,
    expenses: 0,
    net: 0,
  }));
  currentDocs.forEach((doc) => {
    const point = dailyTrend[getBangkokDayOfMonth(doc.transactionDate) - 1];
    if (!point) return;
    if (doc.type === 'income') point.income += doc.amount;
    else point.expenses += doc.amount;
    point.net = point.income - point.expenses;
  });
  const expenseByDay = new Map<number, number>();
  expenseDocs.forEach((doc) => {
    const day = getBangkokDayOfMonth(doc.transactionDate);
    expenseByDay.set(day, (expenseByDay.get(day) || 0) + doc.amount);
  });
  const highestSpendingDay =
    expenseByDay.size > 0
      ? Array.from(expenseByDay.entries())
          .map(([day, amount]) => ({ day, amount }))
          .sort((a, b) => b.amount - a.amount)[0]
      : null;

  return corsResponse(
    {
      year,
      month,
      income,
      expenses,
      net: income - expenses,
      transactionCount: currentDocs.length,
      averageDailyExpense: daysInMonth > 0 ? Math.round(expenses / daysInMonth) : 0,
      highestExpense: expenseDocs.length > 0 ? Math.max(...expenseDocs.map((d) => d.amount)) : 0,
      expenseByCategory,
      incomeByCategory,
      dailyTrend,
      highestSpendingDay,
      savingsRate:
        income > 0 ? Math.round(((income - expenses) / income) * 100) : null,
      previousMonth:
        prevDocs.length > 0
          ? { income: prevIncome, expenses: prevExpenses, net: prevIncome - prevExpenses }
          : null,
    },
    request
  );
}
