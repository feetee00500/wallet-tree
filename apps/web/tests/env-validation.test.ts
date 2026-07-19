import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Environment validation', () => {
  it('should reject empty SESSION_SECRET', () => {
    const schema = z.object({
      SESSION_SECRET: z.string().min(32),
    });

    const result = schema.safeParse({ SESSION_SECRET: 'short' });
    expect(result.success).toBe(false);
  });

  it('should require MONGODB_URI', () => {
    const schema = z.object({
      MONGODB_URI: z.string().min(1),
    });

    const result = schema.safeParse({ MONGODB_URI: '' });
    expect(result.success).toBe(false);
  });

  it('keeps local admin login disabled by default', () => {
    const schema = z.object({
      ENABLE_LOCAL_ADMIN_LOGIN: z.enum(['true', 'false']).default('false'),
    });
    expect(schema.parse({}).ENABLE_LOCAL_ADMIN_LOGIN).toBe('false');
  });
});
