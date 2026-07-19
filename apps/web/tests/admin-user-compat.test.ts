import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import {
  isUserActive,
  normalizeAdminIdentifier,
  publicUser,
  resolveAuthProvider,
  resolveUserRole,
} from '@/lib/auth/user-compat';
import type { UserDocument } from '@/lib/db/models';

const legacyLineUser = {
  _id: new ObjectId(),
  lineUserId: 'existing-line-id',
  displayName: 'Existing LINE User',
  preferredCurrency: 'THB',
  timezone: 'Asia/Bangkok',
  language: 'th',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  lastActiveAt: new Date('2025-01-01'),
} satisfies UserDocument;

describe('backward-compatible user defaults', () => {
  it('treats an existing LINE user without authProvider as LINE', () => {
    expect(resolveAuthProvider(legacyLineUser)).toBe('line');
  });

  it('treats a missing role as user', () => {
    expect(resolveUserRole({})).toBe('user');
  });

  it('treats a missing status as active', () => {
    expect(isUserActive({})).toBe(true);
  });

  it('normalizes usernames and email addresses consistently', () => {
    expect(normalizeAdminIdentifier('  Admin@Example.COM ')).toBe(
      'admin@example.com'
    );
  });

  it('never serializes password hashes', () => {
    const serialized = publicUser({
      ...legacyLineUser,
      authProvider: 'local_admin',
      role: 'admin',
      username: 'maintenance-admin',
      passwordHash: 'never-expose-this',
    });
    expect(serialized).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(serialized)).not.toContain('never-expose-this');
  });

  it('requires no migration for a legacy LINE record', () => {
    expect(() => publicUser(legacyLineUser)).not.toThrow();
  });
});
