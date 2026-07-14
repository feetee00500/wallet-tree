import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getTransactionsCollection } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = parseInt(searchParams.get('year') || String(now.getFullYear()));
  const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1));

  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const startOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth - 1, 1));
  const endOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));

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
      previousMonth:
        prevDocs.length > 0
          ? { income: prevIncome, expenses: prevExpenses, net: prevIncome - prevExpenses }
          : null,
    },
    request
  );
}
