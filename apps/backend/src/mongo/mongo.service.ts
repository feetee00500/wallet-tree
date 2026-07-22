import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, ensureMongoIndexes, MongoClient } from '@wallet-tree/database';

type MongoCache = { client?: MongoClient; db?: Db; connecting?: Promise<Db> };
const cache = globalThis as typeof globalThis & { __walletTreeMongo?: MongoCache };
cache.__walletTreeMongo ??= {};

@Injectable()
export class MongoService implements OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}

  async db(): Promise<Db> {
    const state = cache.__walletTreeMongo!;
    if (state.db) return state.db;
    if (!state.connecting) {
      state.connecting = this.connect().catch((error: unknown) => {
        state.connecting = undefined;
        throw error;
      });
    }
    return state.connecting;
  }

  private async connect(): Promise<Db> {
    const uri = this.config.getOrThrow<string>('MONGODB_URI');
    const databaseName = this.config.get<string>('MONGODB_DB_NAME') || 'wallet_tree';
    const client = new MongoClient(uri, { maxPoolSize: 10, minPoolSize: 0 });
    await client.connect();
    const db = client.db(databaseName);
    cache.__walletTreeMongo!.client = client;
    cache.__walletTreeMongo!.db = db;
    await ensureMongoIndexes(db);
    return db;
  }

  async onModuleDestroy(): Promise<void> {
    // Vercel reuses the client between warm invocations. Local process shutdown
    // does not need an explicit close and avoiding it prevents race conditions.
  }
}
