import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleCors } from './lib/auth/cors';

export function middleware(request: NextRequest) {
  const corsError = handleCors(request);
  if (corsError) return corsError;

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
