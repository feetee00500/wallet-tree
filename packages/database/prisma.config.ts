import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // `prisma generate` does not connect; a local fallback keeps installs and CI builds deterministic.
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/wallet_tree',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
