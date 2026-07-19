import type {
  CreateIndexesOptions,
  Db,
  IndexDescriptionInfo,
} from 'mongodb';
import { pathToFileURL } from 'node:url';
import { confirmWrite, withDatabase } from './db-safety';

type ExpectedIndex = {
  collection: string;
  name: string;
  key: Record<string, 1>;
  options: CreateIndexesOptions;
};

export const expectedIndexes: ExpectedIndex[] = [
  {
    collection: 'users',
    name: 'uniq_local_admin_username_normalized',
    key: { usernameNormalized: 1 },
    options: {
      unique: true,
      partialFilterExpression: {
        authProvider: 'local_admin',
        usernameNormalized: { $type: 'string' },
      },
    },
  },
  {
    collection: 'users',
    name: 'uniq_local_admin_email_normalized',
    key: { emailNormalized: 1 },
    options: {
      unique: true,
      partialFilterExpression: {
        authProvider: 'local_admin',
        emailNormalized: { $type: 'string' },
      },
    },
  },
  {
    collection: 'admin_login_rate_limits',
    name: 'ttl_admin_login_rate_limits',
    key: { expiresAt: 1 },
    options: { expireAfterSeconds: 0 },
  },
];

function sameKey(index: IndexDescriptionInfo, key: Record<string, number>) {
  return JSON.stringify(index.key) === JSON.stringify(key);
}

function sameOptions(
  index: IndexDescriptionInfo,
  options: CreateIndexesOptions
) {
  return (
    Boolean(index.unique) === Boolean(options.unique) &&
    (index.expireAfterSeconds ?? undefined) ===
      (options.expireAfterSeconds ?? undefined) &&
    JSON.stringify(index.partialFilterExpression ?? undefined) ===
      JSON.stringify(options.partialFilterExpression ?? undefined)
  );
}

export async function ensureIndexes(db: Db) {
  for (const expected of expectedIndexes) {
    const collection = db.collection(expected.collection);
    const existing = await collection.listIndexes().toArray().catch((error) => {
      if ((error as { codeName?: string }).codeName === 'NamespaceNotFound') return [];
      throw error;
    });
    const named = existing.find((index) => index.name === expected.name);
    if (named) {
      if (
        !sameKey(named, expected.key) ||
        !sameOptions(named, expected.options)
      ) {
        throw new Error(
          `Conflicting index named ${expected.name} on ${expected.collection}.`
        );
      }
      process.stdout.write(`Existing compatible index: ${expected.name}\n`);
      continue;
    }
    const conflictingKey = existing.find((index) => sameKey(index, expected.key));
    if (conflictingKey) {
      throw new Error(
        `Index key conflict on ${expected.collection}: ${conflictingKey.name}. No changes made to that index.`
      );
    }
    await collection.createIndex(expected.key, {
      name: expected.name,
      ...expected.options,
    });
    process.stdout.write(`Created index: ${expected.name}\n`);
  }
}

async function inspect(db: Db, databaseName: string) {
  process.stdout.write(`Target MongoDB database: ${databaseName}\n`);
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  process.stdout.write(
    `Collections: ${collections.map(({ name }) => name).sort().join(', ')}\n`
  );
  const users = db.collection('users');
  const [lineUsers, localAdmins, missingProvider, missingRole, missingStatus] =
    await Promise.all([
      users.countDocuments({
        lineUserId: { $exists: true },
        $or: [{ authProvider: 'line' }, { authProvider: { $exists: false } }],
      }),
      users.countDocuments({ authProvider: 'local_admin' }),
      users.countDocuments({ authProvider: { $exists: false } }),
      users.countDocuments({ role: { $exists: false } }),
      users.countDocuments({ status: { $exists: false } }),
    ]);
  process.stdout.write(`LINE users: ${lineUsers}\n`);
  process.stdout.write(`Local admins: ${localAdmins}\n`);
  process.stdout.write(`Users missing optional authProvider: ${missingProvider}\n`);
  process.stdout.write(`Users missing optional role: ${missingRole}\n`);
  process.stdout.write(`Users missing optional status: ${missingStatus}\n`);
  const indexes = await users.listIndexes().toArray();
  process.stdout.write(
    `User indexes: ${indexes.map(({ name }) => name).sort().join(', ')}\n`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const command = process.argv[2];
  withDatabase(async (db, databaseName) => {
    if (command === 'inspect') return inspect(db, databaseName);
    if (command === 'ensure-indexes') {
      await confirmWrite(databaseName);
      return ensureIndexes(db);
    }
    throw new Error('Unknown database command.');
  }).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : 'Command failed.'}\n`);
    process.exitCode = 1;
  });
}
