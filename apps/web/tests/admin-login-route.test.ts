import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  enabled: true,
  authResult: { ok: false } as
    | { ok: false }
    | {
        ok: true;
        user: {
          _id: { toString(): string };
          mustChangePassword: boolean;
          sessionVersion: number;
        };
      },
  createSession: vi.fn(),
  rateAllowed: true,
}));

vi.mock('@/lib/validation/env', () => ({
  isLocalAdminLoginEnabled: () => mocks.enabled,
}));
vi.mock('@/lib/auth/session', () => ({
  createSession: mocks.createSession,
}));
vi.mock('@/lib/auth/admin-auth', () => ({
  GENERIC_ADMIN_LOGIN_ERROR: 'Invalid credentials or account unavailable.',
  adminLoginSchema: {
    safeParse: (body: { identifier?: string; password?: string }) =>
      body.identifier && body.password
        ? { success: true, data: body }
        : { success: false },
  },
  consumeAdminLoginRateLimit: () => mocks.rateAllowed,
  authenticateLocalAdmin: () => mocks.authResult,
}));

import { POST } from '@/app/api/auth/admin/login/route';

function request(identifier: string, password: string) {
  return new NextRequest('http://localhost/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password, role: 'admin' }),
    headers: { 'content-type': 'application/json' },
  });
}

describe('admin login route', () => {
  beforeEach(() => {
    mocks.enabled = true;
    mocks.authResult = { ok: false };
    mocks.rateAllowed = true;
    mocks.createSession.mockReset();
  });

  it('uses the same public failure for unknown users and wrong passwords', async () => {
    const unknown = await POST(request('unknown', 'wrong password'));
    const wrong = await POST(request('known', 'wrong password'));
    expect(unknown.status).toBe(401);
    expect(await unknown.json()).toEqual(await wrong.json());
  });

  it('rejects login server-side when the feature is disabled', async () => {
    mocks.enabled = false;
    expect((await POST(request('admin', 'password'))).status).toBe(401);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it('creates an authoritative admin session and requires first-login change', async () => {
    mocks.authResult = {
      ok: true,
      user: {
        _id: { toString: () => 'database-user-id' },
        mustChangePassword: true,
        sessionVersion: 3,
      },
    };
    const response = await POST(request('admin', 'password'));
    expect(response.status).toBe(200);
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'database-user-id',
        authProvider: 'local_admin',
        role: 'admin',
        sessionVersion: 3,
      })
    );
    await expect(response.json()).resolves.toMatchObject({
      redirectTo: '/admin/change-password',
      mustChangePassword: true,
    });
  });
});
