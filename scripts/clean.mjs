import { rm } from 'node:fs/promises';

const generatedPaths = [
  'apps/web/.next',
  'apps/web/coverage',
  'apps/web/tsconfig.tsbuildinfo',
  'packages/shared/dist',
];

await Promise.all(
  generatedPaths.map((path) => rm(path, { recursive: true, force: true }))
);
