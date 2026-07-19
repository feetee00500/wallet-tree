import { NextResponse, type NextRequest } from 'next/server';
import { compare } from 'bcryptjs';
import {
  adminPasswordChangeSchema,
  hashAdminPassword,
} from '@/lib/auth/admin-auth';
import { requireAdmin } from '@/lib/auth/middleware';
import { createSession } from '@/lib/auth/session';
import { getUsersCollection } from '@/lib/db/models';

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request, {
    allowPasswordChangeRequired: true,
  });
  if (admin instanceof NextResponse) return admin;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  const parsed = adminPasswordChangeSchema.safeParse(body);
  if (!parsed.success || !admin.passwordHash) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  const currentMatches = await compare(
    parsed.data.currentPassword,
    admin.passwordHash
  );
  if (!currentMatches) {
    return NextResponse.json(
      { message: 'Current password is incorrect.' },
      { status: 400 }
    );
  }

  const reusesCurrent = await compare(
    parsed.data.newPassword,
    admin.passwordHash
  );
  if (reusesCurrent) {
    return NextResponse.json(
      { message: 'New password must be different.' },
      { status: 400 }
    );
  }

  const passwordHash = await hashAdminPassword(parsed.data.newPassword);
  const now = new Date();
  const nextSessionVersion = (admin.sessionVersion ?? 0) + 1;
  const users = await getUsersCollection();
  await users.updateOne(
    { _id: admin._id, authProvider: 'local_admin' },
    {
      $set: {
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: now,
        sessionVersion: nextSessionVersion,
        failedLoginAttempts: 0,
        updatedAt: now,
      },
      $unset: { lockedUntil: '' },
    }
  );

  await createSession({
    userId: admin._id.toString(),
    authProvider: 'local_admin',
    role: 'admin',
    sessionVersion: nextSessionVersion,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true, redirectTo: '/admin' });
}
