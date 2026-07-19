import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const userId = new ObjectId();
const mocks = vi.hoisted(() => ({
  session: null as Record<string, unknown> | null,
  user: null as Record<string, unknown> | null,
}));

vi.mock('@/lib/auth/session', () => ({
  getSession: () => mocks.session,
}));
vi.mock('@/lib/db/models', () => ({
  getUsersCollection: () => ({
    findOne: () => mocks.user,
  }),
}));
vi.mock('@/lib/auth/cors', () => ({
  handleCors: () => null,
  corsResponse: (body: unknown, _request: unknown, init?: ResponseInit) =>
    NextResponse.json(body, init),
}));

import { requireAdmin } from '@/lib/auth/middleware';

const request = new NextRequest('http://localhost/api/admin');

describe('database-backed admin authorization', () => {
  beforeEach(() => {
    mocks.session = {
      userId: userId.toString(),
      authProvider: 'local_admin',
      role: 'admin',
      sessionVersion: 0,
      createdAt: Date.now(),
    };
    mocks.user = {
      _id: userId,
      authProvider: 'local_admin',
      role: 'admin',
      status: 'active',
      sessionVersion: 0,
      displayName: 'Maintenance Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('does not allow a normal LINE user to access admin APIs', async () => {
    mocks.user = {
      ...mocks.user,
      authProvider: 'line',
      role: 'user',
      lineUserId: 'line-id',
    };
    const result = await requireAdmin(request);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('does not trust modified role claims over the database record', async () => {
    mocks.user = { ...mocks.user, role: 'user' };
    const result = await requireAdmin(request);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('rejects stale session versions and enforces first-login password change', async () => {
    mocks.session = { ...mocks.session, sessionVersion: 99 };
    expect((await requireAdmin(request)) as NextResponse).toHaveProperty(
      'status',
      403
    );
    mocks.session = { ...mocks.session, sessionVersion: 0 };
    mocks.user = { ...mocks.user, mustChangePassword: true };
    expect((await requireAdmin(request)) as NextResponse).toHaveProperty(
      'status',
      403
    );
    expect(
      await requireAdmin(request, { allowPasswordChangeRequired: true })
    ).not.toBeInstanceOf(NextResponse);
  });
});
