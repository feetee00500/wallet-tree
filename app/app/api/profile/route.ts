import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { corsResponse } from '@/lib/auth/cors';
import { getUsersCollection } from '@/lib/db/models';
import { updateProfileSchema } from '@wallet-tree/shared';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: auth.userId as any });

  if (!user) {
    return corsResponse({ message: 'User not found' }, request, { status: 404 });
  }

  return corsResponse(
    {
      _id: user._id!.toString(),
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
      statusMessage: user.statusMessage,
      preferredCurrency: user.preferredCurrency,
      timezone: user.timezone,
      language: user.language,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastActiveAt: user.lastActiveAt.toISOString(),
    },
    request
  );
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsResponse({ message: 'Invalid JSON body' }, request, { status: 400 });
  }

  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    return corsResponse(
      { message: 'Validation error', errors: result.error.flatten().fieldErrors },
      request,
      { status: 400 }
    );
  }

  const users = await getUsersCollection();
  await users.updateOne(
    { _id: auth.userId as any },
    { $set: { ...result.data, updatedAt: new Date() } }
  );

  const updated = await users.findOne({ _id: auth.userId as any });

  return corsResponse(
    {
      _id: updated!._id!.toString(),
      lineUserId: updated!.lineUserId,
      displayName: updated!.displayName,
      pictureUrl: updated!.pictureUrl,
      preferredCurrency: updated!.preferredCurrency,
      timezone: updated!.timezone,
      language: updated!.language,
      updatedAt: updated!.updatedAt.toISOString(),
    },
    request
  );
}
