import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().min(1).default('wallet-tree'),
  LINE_CHANNEL_ID: z.string().optional().default(''),
  LINE_CHANNEL_SECRET: z.string().optional().default(''),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().optional().default(''),
  LINE_LOGIN_CHANNEL_ID: z.string().min(1, 'LINE_LOGIN_CHANNEL_ID is required'),
  LINE_LOGIN_CHANNEL_SECRET: z.string().min(1, 'LINE_LOGIN_CHANNEL_SECRET is required'),
  LINE_LOGIN_CALLBACK_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().default(''),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),
  ENABLE_LOCAL_ADMIN_LOGIN: z.enum(['true', 'false']).default('false'),
  ADMIN_LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
  ADMIN_LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
});

export type EnvConfig = z.infer<typeof envSchema>;

let validatedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (validatedEnv) return validatedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    console.error(`Missing or invalid environment variables: ${missing}`);
    throw new Error(`Environment validation failed: ${missing}`);
  }
  validatedEnv = result.data;
  return validatedEnv;
}

export function isLocalAdminLoginEnabled(): boolean {
  return getEnv().ENABLE_LOCAL_ADMIN_LOGIN === 'true';
}

export function getAllowedOrigins(): string[] {
  const env = getEnv();
  const origins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim()).filter(Boolean)
    : [];
  if (env.FRONTEND_URL && !origins.includes(env.FRONTEND_URL)) {
    origins.push(env.FRONTEND_URL);
  }
  return [...new Set(origins)];
}
