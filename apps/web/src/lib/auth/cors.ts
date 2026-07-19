import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllowedOrigins } from '@/lib/validation/env';

export function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = getAllowedOrigins();

  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { message: 'Origin not allowed' },
      { status: 403 }
    );
  }

  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response.headers, origin, allowedOrigins);
    return response;
  }

  return null;
}

export function setCorsHeaders(
  headers: Headers,
  origin: string,
  allowedOrigins: string[]
): void {
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '';

  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400');
  }
}

export function corsResponse(
  body: unknown,
  request: NextRequest,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(body, init);
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = getAllowedOrigins();
  setCorsHeaders(response.headers, origin, allowedOrigins);
  return response;
}

export function corsEmptyResponse(
  request: NextRequest,
  status = 204
): NextResponse {
  const response = new NextResponse(null, { status });
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = getAllowedOrigins();
  setCorsHeaders(response.headers, origin, allowedOrigins);
  return response;
}
