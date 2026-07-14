import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getCategoriesCollection } from '@/lib/db/models';
import { updateCategorySchema } from '@wallet-tree/shared';

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

  const result = updateCategorySchema.safeParse(body);
  if (!result.success) {
    return corsResponse(
      { message: 'Validation error', errors: result.error.flatten().fieldErrors },
      request,
      { status: 400 }
    );
  }

  const categories = await getCategoriesCollection();
  const existing = await categories.findOne({ _id: new ObjectId(id) });

  if (!existing || existing.userId !== auth.userId) {
    return corsResponse({ message: 'Category not found' }, request, { status: 404 });
  }

  await categories.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...result.data, updatedAt: new Date() } }
  );

  return corsResponse({ message: 'Category updated' }, request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const categories = await getCategoriesCollection();
  const existing = await categories.findOne({ _id: new ObjectId(id) });

  if (!existing || existing.userId !== auth.userId) {
    return corsResponse({ message: 'Category not found' }, request, { status: 404 });
  }

  await categories.deleteOne({ _id: new ObjectId(id) });

  return corsResponse({ message: 'Category deleted' }, request, { status: 204 });
}
