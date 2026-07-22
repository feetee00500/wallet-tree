import { config } from 'dotenv';
import { resolve } from 'node:path';
import { hash } from 'bcryptjs';
import {
  AuthProvider,
  CategoryDocument,
  ensureMongoIndexes,
  MongoClient,
  ObjectId,
  TransactionType,
  UserDocument,
  UserRole,
  UserStatus,
} from '../src';

config({ path: resolve(__dirname, '../../../.env') });

const categories = [
  ['อาหาร', '🍚', TransactionType.EXPENSE],
  ['เดินทาง', '🚗', TransactionType.EXPENSE],
  ['ที่อยู่', '🏠', TransactionType.EXPENSE],
  ['สุขภาพ', '💊', TransactionType.EXPENSE],
  ['บันเทิง', '🎬', TransactionType.EXPENSE],
  ['การศึกษา', '📚', TransactionType.EXPENSE],
  ['อื่นๆ', '📦', TransactionType.EXPENSE],
  ['เงินเดือน', '💰', TransactionType.INCOME],
  ['โบนัส', '🎁', TransactionType.INCOME],
  ['รายได้อื่นๆ', '💵', TransactionType.INCOME],
] as const;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'wallet_tree');
    await ensureMongoIndexes(db);
    const now = new Date();
    const categoryCollection = db.collection<CategoryDocument>('categories');
    for (const [name, icon, type] of categories) {
      await categoryCollection.updateOne(
        { userId: null, type: { $in: [type, type.toLowerCase()] }, $or: [{ name }, { nameTh: name }] },
        {
          $set: { name, nameTh: name, nameEn: name, icon, type, isArchived: false, updatedAt: now },
          $setOnInsert: { _id: new ObjectId(), userId: null, createdAt: now },
        },
        { upsert: true },
      );
    }

    const username = process.env.ADMIN_USERNAME?.trim().toLocaleLowerCase('en-US');
    const password = process.env.ADMIN_PASSWORD;
    if (username && password) {
      if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
      await db.collection<UserDocument>('users').updateOne(
        { $or: [{ usernameNormalized: username }, { username }] },
        {
          $setOnInsert: {
            _id: new ObjectId(),
            username,
            usernameNormalized: username,
            passwordHash: await hash(password, 12),
            name: 'Wallet Tree Admin',
            displayName: 'Wallet Tree Admin',
            authProvider: AuthProvider.LOCAL_ADMIN,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            mustChangePassword: false,
            failedLoginAttempts: 0,
            sessionVersion: 0,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
      console.log(`Ensured local administrator: ${username}`);
    }
    console.log(`Ensured ${categories.length} default categories.`);
  } finally {
    await client.close();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
