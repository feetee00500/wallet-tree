import { createHash } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import {
  getAdminLoginRateLimitsCollection,
  getUsersCollection,
  type UserDocument,
} from '@/lib/db/models';
import { getEnv, isLocalAdminLoginEnabled } from '@/lib/validation/env';
import {
  isUserActive,
  normalizeAdminIdentifier,
  resolveAuthProvider,
  resolveUserRole,
} from './user-compat';

export const adminPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(256, 'Password must be at most 256 characters');

export const adminLoginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(256),
});

export const adminPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    newPassword: adminPasswordSchema,
    confirmPassword: z.string().min(1).max(256),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const GENERIC_ADMIN_LOGIN_ERROR =
  'Invalid credentials or account unavailable.';

export function isAdminAccount(user: UserDocument): boolean {
  return (
    resolveAuthProvider(user) === 'local_admin' &&
    resolveUserRole(user) === 'admin' &&
    isUserActive(user)
  );
}

export function isAccountLocked(
  user: Pick<UserDocument, 'lockedUntil'>,
  now = new Date()
): boolean {
  return Boolean(user.lockedUntil && user.lockedUntil > now);
}

export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return compare(password, passwordHash);
}

function rateLimitKey(identifier: string, clientKey: string): string {
  return createHash('sha256')
    .update(`${normalizeAdminIdentifier(identifier)}\0${clientKey}`)
    .digest('hex');
}

export async function consumeAdminLoginRateLimit(
  identifier: string,
  clientKey: string,
  now = new Date()
): Promise<boolean> {
  const env = getEnv();
  const limits = await getAdminLoginRateLimitsCollection();
  const key = rateLimitKey(identifier, clientKey);
  const expiresAt = new Date(
    now.getTime() + env.ADMIN_LOGIN_LOCKOUT_MINUTES * 60_000
  );

  const existing = await limits.findOne({ _id: key });
  if (existing && existing.expiresAt > now) {
    if (existing.attempts >= env.ADMIN_LOGIN_MAX_ATTEMPTS * 4) return false;
    await limits.updateOne({ _id: key }, { $inc: { attempts: 1 } });
    return true;
  }

  await limits.updateOne(
    { _id: key },
    { $set: { attempts: 1, expiresAt } },
    { upsert: true }
  );
  return true;
}

export type AdminLoginResult =
  | { ok: true; user: UserDocument }
  | { ok: false };

export async function authenticateLocalAdmin(
  identifier: string,
  password: string,
  now = new Date()
): Promise<AdminLoginResult> {
  if (!isLocalAdminLoginEnabled()) return { ok: false };

  const normalized = normalizeAdminIdentifier(identifier);
  const users = await getUsersCollection();
  const user = await users.findOne({
    authProvider: 'local_admin',
    $or: [
      { usernameNormalized: normalized },
      { emailNormalized: normalized },
    ],
  });

  if (
    !user ||
    !isAdminAccount(user) ||
    !user.passwordHash ||
    isAccountLocked(user, now)
  ) {
    return { ok: false };
  }

  const passwordMatches = await verifyAdminPassword(password, user.passwordHash);
  if (!passwordMatches) {
    const updated = await users.findOneAndUpdate(
      { _id: user._id, authProvider: 'local_admin' },
      { $inc: { failedLoginAttempts: 1 }, $set: { updatedAt: now } },
      { returnDocument: 'after' }
    );
    const failures = updated?.failedLoginAttempts ?? 1;
    const env = getEnv();
    if (failures >= env.ADMIN_LOGIN_MAX_ATTEMPTS) {
      await users.updateOne(
        { _id: user._id, authProvider: 'local_admin' },
        {
          $set: {
            lockedUntil: new Date(
              now.getTime() + env.ADMIN_LOGIN_LOCKOUT_MINUTES * 60_000
            ),
            updatedAt: now,
          },
        }
      );
    }
    return { ok: false };
  }

  const refreshed = await users.findOneAndUpdate(
    { _id: user._id, authProvider: 'local_admin' },
    {
      $set: {
        failedLoginAttempts: 0,
        lastLoginAt: now,
        updatedAt: now,
      },
      $unset: { lockedUntil: '' },
    },
    { returnDocument: 'after' }
  );

  return refreshed ? { ok: true, user: refreshed } : { ok: false };
}
