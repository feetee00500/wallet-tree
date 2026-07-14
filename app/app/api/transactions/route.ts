import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Filter } from 'mongodb';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getTransactionsCollection, type TransactionDocument } from '@/lib/db/models';
import { createTransactionSchema, transactionQuerySchema } from '@wallet-tree/shared';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const queryResult = transactionQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!queryResult.success) {
    return corsResponse(
      { message: 'Invalid query parameters', errors: queryResult.error.flatten().fieldErrors },
      request,
      { status: 400 }
    );
  }

  const { page, pageSize, type, categoryId, startDate, endDate, search, sortBy, sortOrder } =
    queryResult.data;

  const filter: Filter<TransactionDocument> = { userId: auth.userId as any };
  if (type) filter.type = type;
  if (categoryId) filter.categoryId = categoryId;
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    filter.transactionDate = dateFilter as any;
  }
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { categoryName: { $regex: search, $options: 'i' } },
    ] as any;
  }

  const transactions = await getTransactionsCollection();
  const total = await transactions.countDocuments(filter);
  const docs = await transactions
    .find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return corsResponse(
    {
      data: docs.map((doc) => ({
        _id: doc._id!.toString(),
        userId: doc.userId,
        type: doc.type,
        amount: doc.amount,
        categoryId: doc.categoryId,
        categoryName: doc.categoryName,
        description: doc.description,
        note: doc.note,
        transactionDate: doc.transactionDate.toISOString(),
        source: doc.source,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    request
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsResponse({ message: 'Invalid JSON body' }, request, { status: 400 });
  }

  const result = createTransactionSchema.safeParse(body);
  if (!result.success) {
    return corsResponse(
      { message: 'Validation error', errors: result.error.flatten().fieldErrors },
      request,
      { status: 400 }
    );
  }

  const transactions = await getTransactionsCollection();
  const now = new Date();
  const doc = await transactions.insertOne({
    ...result.data,
    userId: auth.userId,
    transactionDate: new Date(result.data.transactionDate),
    source: 'web',
    createdAt: now,
    updatedAt: now,
  } as any);

  const created = await transactions.findOne({ _id: doc.insertedId });

  return corsResponse(
    {
      _id: created!._id!.toString(),
      userId: created!.userId,
      type: created!.type,
      amount: created!.amount,
      categoryId: created!.categoryId,
      categoryName: created!.categoryName,
      description: created!.description,
      note: created!.note,
      transactionDate: created!.transactionDate.toISOString(),
      source: created!.source,
      createdAt: created!.createdAt.toISOString(),
      updatedAt: created!.updatedAt.toISOString(),
    },
    request,
    { status: 201 }
  );
}
