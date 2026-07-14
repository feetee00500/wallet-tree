import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { corsResponse } from '@/lib/auth/cors';
import { getUsersCollection } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return corsResponse({ message: 'Unauthorized' }, request, { status: 401 });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: session.userId as any });

  if (!user) {
    return corsResponse({ message: 'User not found' }, request, { status: 401 });
  }

  return corsResponse(
    {
      _id: user._id.toString(),
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
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
