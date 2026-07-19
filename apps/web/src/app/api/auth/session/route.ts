import type { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/auth/cors';
import { getCurrentUser } from '@/lib/auth/middleware';
import { publicUser } from '@/lib/auth/user-compat';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return corsResponse({ message: 'Unauthorized' }, request, { status: 401 });
  }

  return corsResponse(publicUser(user), request);
}
