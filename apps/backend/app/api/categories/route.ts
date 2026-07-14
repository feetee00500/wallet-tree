import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getCategoriesCollection } from '@/lib/db/models';
import { createCategorySchema } from '@wallet-tree/shared';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const categories = await getCategoriesCollection();
  const docs = await categories
    .find({ userId: auth.userId, isArchived: { $ne: true } })
    .sort({ order: 1, nameTh: 1 })
    .toArray();

  return corsResponse(
    docs.map((doc) => ({
      _id: doc._id!.toString(),
      userId: doc.userId,
      key: doc.key,
      nameTh: doc.nameTh,
      nameEn: doc.nameEn,
      type: doc.type,
      icon: doc.icon,
      color: doc.color,
      order: doc.order,
      isArchived: doc.isArchived,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    })),
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

  const result = createCategorySchema.safeParse(body);
  if (!result.success) {
    return corsResponse(
      { message: 'Validation error', errors: result.error.flatten().fieldErrors },
      request,
      { status: 400 }
    );
  }

  const categories = await getCategoriesCollection();
  const now = new Date();
  const doc = await categories.insertOne({
    ...result.data,
    userId: auth.userId,
    isArchived: false,
    order: result.data.order ?? 0,
    createdAt: now,
    updatedAt: now,
  } as any);

  const created = await categories.findOne({ _id: doc.insertedId });

  return corsResponse(
    {
      _id: created!._id!.toString(),
      ...result.data,
      userId: auth.userId,
      isArchived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    request,
    { status: 201 }
  );
}
