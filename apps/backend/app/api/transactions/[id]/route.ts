import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getTransactionsCollection } from '@/lib/db/models';
import { updateTransactionSchema } from '@wallet-tree/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const transactions = await getTransactionsCollection();
  const doc = await transactions.findOne({ _id: new ObjectId(id) });

  if (!doc || doc.userId !== auth.userId) {
    return corsResponse({ message: 'Transaction not found' }, request, { status: 404 });
  }

  return corsResponse(
    {
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
    },
    request
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsResponse({ message: 'Invalid JSON body' }, request, { status: 400 });
  }

  const result = updateTransactionSchema.safeParse(body);
  if (!result.success) {
    return corsResponse(
      { message: 'Validation error', errors: result.error.flatten().fieldErrors },
      request,
      { status: 400 }
    );
  }

  const transactions = await getTransactionsCollection();
  const existing = await transactions.findOne({ _id: new ObjectId(id) });

  if (!existing || existing.userId !== auth.userId) {
    return corsResponse({ message: 'Transaction not found' }, request, { status: 404 });
  }

  const updateData: Record<string, unknown> = { ...result.data, updatedAt: new Date() };
  if (result.data.transactionDate) {
    updateData.transactionDate = new Date(result.data.transactionDate);
  }

  await transactions.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  return corsResponse({ message: 'Transaction updated' }, request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const transactions = await getTransactionsCollection();
  const existing = await transactions.findOne({ _id: new ObjectId(id) });

  if (!existing || existing.userId !== auth.userId) {
    return corsResponse({ message: 'Transaction not found' }, request, { status: 404 });
  }

  await transactions.deleteOne({ _id: new ObjectId(id) });

  return corsResponse({ message: 'Transaction deleted' }, request, { status: 204 });
}
