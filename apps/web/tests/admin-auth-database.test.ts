import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

const mocks = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  findOneAndUpdate: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock('@/lib/validation/env', () => ({
  isLocalAdminLoginEnabled: () => true,
  getEnv: () => ({
    ADMIN_LOGIN_MAX_ATTEMPTS: 5,
    ADMIN_LOGIN_LOCKOUT_MINUTES: 15,
  }),
}));
vi.mock('@/lib/db/models', () => ({
  getUsersCollection: () => ({
    findOne: () => mocks.user,
    findOneAndUpdate: mocks.findOneAndUpdate,
    updateOne: mocks.updateOne,
  }),
  getAdminLoginRateLimitsCollection: vi.fn(),
}));

import { authenticateLocalAdmin } from '@/lib/auth/admin-auth';

describe('admin account database protections', () => {
  beforeEach(async () => {
    const passwordHash = await hash('correct horse battery staple', 4);
    mocks.user = {
      _id: new ObjectId(),
      authProvider: 'local_admin',
      role: 'admin',
      status: 'active',
      usernameNormalized: 'maintenance-admin',
      displayName: 'Maintenance Admin',
      passwordHash,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mocks.findOneAndUpdate.mockReset();
    mocks.updateOne.mockReset();
  });

  it('increments failed-login counters for a wrong password', async () => {
    mocks.findOneAndUpdate.mockResolvedValue({
      ...mocks.user,
      failedLoginAttempts: 1,
    });
    await expect(
      authenticateLocalAdmin('maintenance-admin', 'wrong password')
    ).resolves.toEqual({ ok: false });
    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ authProvider: 'local_admin' }),
      expect.objectContaining({ $inc: { failedLoginAttempts: 1 } }),
      expect.anything()
    );
  });

  it('resets failures after a successful login', async () => {
    mocks.findOneAndUpdate.mockResolvedValue(mocks.user);
    await expect(
      authenticateLocalAdmin(
        'maintenance-admin',
        'correct horse battery staple'
      )
    ).resolves.toMatchObject({ ok: true });
    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ authProvider: 'local_admin' }),
      expect.objectContaining({
        $set: expect.objectContaining({ failedLoginAttempts: 0 }),
        $unset: { lockedUntil: '' },
      }),
      expect.anything()
    );
  });

  it('rejects disabled and temporarily locked accounts without verification writes', async () => {
    mocks.user = { ...mocks.user, status: 'disabled' };
    await expect(
      authenticateLocalAdmin('maintenance-admin', 'correct horse battery staple')
    ).resolves.toEqual({ ok: false });
    mocks.user = {
      ...mocks.user,
      status: 'active',
      lockedUntil: new Date(Date.now() + 60_000),
    };
    await expect(
      authenticateLocalAdmin('maintenance-admin', 'correct horse battery staple')
    ).resolves.toEqual({ ok: false });
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
