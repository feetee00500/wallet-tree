import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import {
  adminLoginSchema,
  adminPasswordChangeSchema,
  hashAdminPassword,
  isAccountLocked,
  isAdminAccount,
  verifyAdminPassword,
} from '@/lib/auth/admin-auth';
import type { UserDocument } from '@/lib/db/models';

const admin = {
  _id: new ObjectId(),
  authProvider: 'local_admin',
  role: 'admin',
  status: 'active',
  username: 'maintenance-admin',
  usernameNormalized: 'maintenance-admin',
  displayName: 'Maintenance Admin',
  passwordHash: 'placeholder',
  mustChangePassword: true,
  failedLoginAttempts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies UserDocument;

describe('local admin authentication rules', () => {
  it('accepts valid login input and ignores client role fields', () => {
    const result = adminLoginSchema.parse({
      identifier: admin.username,
      password: 'a valid password',
      role: 'admin',
    });
    expect(result).not.toHaveProperty('role');
  });

  it('recognizes only active local admin database records', () => {
    expect(isAdminAccount(admin)).toBe(true);
    expect(isAdminAccount({ ...admin, role: 'user' })).toBe(false);
    expect(isAdminAccount({ ...admin, status: 'disabled' })).toBe(false);
  });

  it('recognizes temporary account lockout', () => {
    expect(isAccountLocked({ lockedUntil: new Date(Date.now() + 60_000) })).toBe(true);
    expect(isAccountLocked({ lockedUntil: new Date(Date.now() - 60_000) })).toBe(false);
  });

  it('hashes and verifies passwords without plaintext storage', async () => {
    const password = 'correct horse battery staple';
    const passwordHash = await hashAdminPassword(password);
    expect(passwordHash).not.toContain(password);
    await expect(verifyAdminPassword(password, passwordHash)).resolves.toBe(true);
    await expect(verifyAdminPassword('wrong password', passwordHash)).resolves.toBe(false);
  });

  it('rejects password reuse and mismatched confirmation inputs', () => {
    expect(
      adminPasswordChangeSchema.safeParse({
        currentPassword: 'old password value',
        newPassword: 'new password value',
        confirmPassword: 'different value',
      }).success
    ).toBe(false);
  });
});
