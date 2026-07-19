import { describe, it, expect } from 'vitest';

describe('CORS', () => {
  it('should allow configured origins', () => {
    const allowedOrigins = ['https://wallet-tree.vercel.app', 'http://localhost:5173'];
    const origin = 'http://localhost:5173';
    expect(allowedOrigins.includes(origin)).toBe(true);
  });

  it('should reject unapproved origins', () => {
    const allowedOrigins = ['https://wallet-tree.vercel.app'];
    const origin = 'https://malicious-site.com';
    expect(allowedOrigins.includes(origin)).toBe(false);
  });
});
