import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { destroySession } from '@/lib/auth/session';
import { corsResponse } from '@/lib/auth/cors';

export async function POST(request: NextRequest) {
  await destroySession();
  return corsResponse({ message: 'Logged out' }, request);
}
