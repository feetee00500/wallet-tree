import { NextResponse, type NextRequest } from 'next/server';
import {
  adminLoginSchema,
  authenticateLocalAdmin,
  consumeAdminLoginRateLimit,
  GENERIC_ADMIN_LOGIN_ERROR,
} from '@/lib/auth/admin-auth';
import { createSession } from '@/lib/auth/session';
import { isLocalAdminLoginEnabled } from '@/lib/validation/env';

const failure = () =>
  NextResponse.json({ message: GENERIC_ADMIN_LOGIN_ERROR }, { status: 401 });

export async function POST(request: NextRequest) {
  if (!isLocalAdminLoginEnabled()) return failure();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure();
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) return failure();

  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientKey = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const withinLimit = await consumeAdminLoginRateLimit(
    parsed.data.identifier,
    clientKey
  );
  if (!withinLimit) return failure();

  const result = await authenticateLocalAdmin(
    parsed.data.identifier,
    parsed.data.password
  );
  if (!result.ok) return failure();

  const user = result.user;
  await createSession({
    userId: user._id.toString(),
    authProvider: 'local_admin',
    role: 'admin',
    sessionVersion: user.sessionVersion ?? 0,
    createdAt: Date.now(),
  });

  const redirectTo = user.mustChangePassword
    ? '/admin/change-password'
    : '/admin';
  return NextResponse.json({
    ok: true,
    mustChangePassword: user.mustChangePassword === true,
    redirectTo,
  });
}
