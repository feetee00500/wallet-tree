import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getTransactionsCollection } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const startOfDay = new Date(dateStr + 'T00:00:00.000+07:00');
  const endOfDay = new Date(dateStr + 'T23:59:59.999+07:00');

  const transactions = await getTransactionsCollection();
  const docs = await transactions
    .find({
      userId: auth.userId,
      transactionDate: { $gte: startOfDay, $lte: endOfDay },
    })
    .sort({ transactionDate: -1 })
    .toArray();

  const income = docs
    .filter((d) => d.type === 'income')
    .reduce((sum, d) => sum + d.amount, 0);

  const expenses = docs
    .filter((d) => d.type === 'expense')
    .reduce((sum, d) => sum + d.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();
  docs.forEach((d) => {
    const existing = categoryMap.get(d.categoryName) || { amount: 0, count: 0 };
    existing.amount += d.amount;
    existing.count += 1;
    categoryMap.set(d.categoryName, existing);
  });

  return corsResponse(
    {
      date: dateStr,
      income,
      expenses,
      net: income - expenses,
      transactionCount: docs.length,
      categories: Array.from(categoryMap.entries()).map(([categoryName, data]) => ({
        categoryName,
        amount: data.amount,
        count: data.count,
      })),
      recentTransactions: docs.slice(0, 10).map((d) => ({
        _id: d._id!.toString(),
        type: d.type,
        amount: d.amount,
        categoryName: d.categoryName,
        description: d.description,
        transactionDate: d.transactionDate.toISOString(),
      })),
    },
    request
  );
}
