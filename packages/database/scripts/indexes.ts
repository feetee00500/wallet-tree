import { config } from 'dotenv';
import { resolve } from 'node:path';
import { ensureMongoIndexes, MongoClient } from '../src';

config({ path: resolve(__dirname, '../../../.env') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    await ensureMongoIndexes(client.db(process.env.MONGODB_DB_NAME || 'wallet_tree'));
    console.log('MongoDB indexes are ready.');
  } finally {
    await client.close();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
