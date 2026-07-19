import { describe, expect, it } from 'vitest';
import { expectedIndexes } from '../../../scripts/db-auth';

describe('admin database indexes', () => {
  it('uses additive partial unique indexes for local admins', () => {
    const username = expectedIndexes.find(
      ({ name }) => name === 'uniq_local_admin_username_normalized'
    );
    const email = expectedIndexes.find(
      ({ name }) => name === 'uniq_local_admin_email_normalized'
    );
    expect(username?.options).toMatchObject({
      unique: true,
      partialFilterExpression: { authProvider: 'local_admin' },
    });
    expect(email?.options).toMatchObject({
      unique: true,
      partialFilterExpression: { authProvider: 'local_admin' },
    });
  });

  it('defines a TTL index for durable login rate-limit records', () => {
    expect(expectedIndexes).toContainEqual(
      expect.objectContaining({
        collection: 'admin_login_rate_limits',
        name: 'ttl_admin_login_rate_limits',
        options: { expireAfterSeconds: 0 },
      })
    );
  });

  it('uses stable names so repeated initialization is idempotent', () => {
    expect(new Set(expectedIndexes.map(({ name }) => name)).size).toBe(
      expectedIndexes.length
    );
  });
});
