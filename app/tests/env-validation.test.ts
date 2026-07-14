import { describe, it, expect } from 'vitest';

describe('Environment validation', () => {
  it('should reject empty SESSION_SECRET', () => {
    const { z } = require('zod');
    const schema = z.object({
      SESSION_SECRET: z.string().min(32),
    });

    const result = schema.safeParse({ SESSION_SECRET: 'short' });
    expect(result.success).toBe(false);
  });

  it('should require MONGODB_URI', () => {
    const { z } = require('zod');
    const schema = z.object({
      MONGODB_URI: z.string().min(1),
    });

    const result = schema.safeParse({ MONGODB_URI: '' });
    expect(result.success).toBe(false);
  });
});
