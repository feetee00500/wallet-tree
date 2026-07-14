import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './session';
import { handleCors, corsResponse } from './cors';

export async function requireAuth(request: NextRequest): Promise<
  | { userId: string; lineUserId: string }
  | NextResponse
> {
  const corsResult = handleCors(request);
  if (corsResult) return corsResult;

  const session = await getSession();
  if (!session) {
    return corsResponse(
      { message: 'Unauthorized' },
      request,
      { status: 401 }
    );
  }

  return { userId: session.userId, lineUserId: session.lineUserId };
}
