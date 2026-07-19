import { MongoClient, Db } from 'mongodb';
import { getEnv } from '../validation/env';

type MongoCache = {
  clientPromise?: Promise<MongoClient>;
  db?: Db;
};

const globalForMongo = globalThis as typeof globalThis & {
  __walletTreeMongo?: MongoCache;
};

const cache = globalForMongo.__walletTreeMongo ?? {};

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.__walletTreeMongo = cache;
}

export async function getDb(): Promise<Db> {
  if (cache.db) return cache.db;

  if (!cache.clientPromise) {
    const env = getEnv();
    const client = new MongoClient(env.MONGODB_URI);
    cache.clientPromise = client.connect();
  }

  const client = await cache.clientPromise;
  const env = getEnv();
  cache.db = client.db(env.MONGODB_DB_NAME);

  return cache.db;
}

export async function closeDb(): Promise<void> {
  if (cache.clientPromise) {
    const client = await cache.clientPromise;
    await client.close();
    cache.clientPromise = undefined;
    cache.db = undefined;
  }
}
