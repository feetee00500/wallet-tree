import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from './session';
import { handleCors, corsResponse } from './cors';
import { getUsersCollection, type UserDocument } from '@/lib/db/models';
import {
  isUserActive,
  resolveAuthProvider,
  resolveUserRole,
} from './user-compat';

export async function getCurrentUser(): Promise<UserDocument | null> {
  const session = await getSession();
  if (!session || !ObjectId.isValid(session.userId)) return null;

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(session.userId) });
  if (!user || !isUserActive(user)) return null;

  if (
    resolveAuthProvider(user) === 'local_admin' &&
    session.sessionVersion !== (user.sessionVersion ?? 0)
  ) {
    return null;
  }

  return user;
}

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

  return { userId: session.userId, lineUserId: session.lineUserId ?? '' };
}

export async function requireAdmin(
  request: NextRequest,
  options: { allowPasswordChangeRequired?: boolean } = {}
): Promise<UserDocument | NextResponse> {
  const corsResult = handleCors(request);
  if (corsResult) return corsResult;

  const session = await getSession();
  if (!session) {
    return corsResponse({ message: 'Unauthorized' }, request, { status: 401 });
  }

  const user = await getCurrentUser();
  if (
    !user ||
    resolveAuthProvider(user) !== 'local_admin' ||
    resolveUserRole(user) !== 'admin' ||
    !isUserActive(user)
  ) {
    return corsResponse({ message: 'Forbidden' }, request, { status: 403 });
  }

  if (user.mustChangePassword && !options.allowPasswordChangeRequired) {
    return corsResponse(
      { message: 'Password change required', code: 'PASSWORD_CHANGE_REQUIRED' },
      request,
      { status: 403 }
    );
  }

  return user;
}
