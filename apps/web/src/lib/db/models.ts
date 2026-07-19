import { ObjectId, type Collection } from 'mongodb';
import { getDb } from './mongodb';

export type AuthProvider = 'line' | 'local_admin';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'disabled';

export interface UserDocument {
  _id: ObjectId;
  lineUserId?: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  preferredCurrency?: string;
  timezone?: string;
  language?: string;
  authProvider?: AuthProvider;
  username?: string;
  usernameNormalized?: string;
  email?: string;
  emailNormalized?: string;
  passwordHash?: string;
  role?: UserRole;
  status?: UserStatus;
  mustChangePassword?: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  sessionVersion?: number;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface AdminLoginRateLimitDocument {
  _id: string;
  attempts: number;
  expiresAt: Date;
}

export interface CategoryDocument {
  _id: ObjectId;
  userId: string;
  key: string;
  nameTh: string;
  nameEn: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionDocument {
  _id: ObjectId;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  note?: string;
  transactionDate: Date;
  source: 'line' | 'web';
  createdAt: Date;
  updatedAt: Date;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  const collection = db.collection<UserDocument>('users');
  await collection.createIndex({ lineUserId: 1 }, { unique: true });
  return collection;
}

export async function getAdminLoginRateLimitsCollection(): Promise<
  Collection<AdminLoginRateLimitDocument>
> {
  const db = await getDb();
  return db.collection<AdminLoginRateLimitDocument>('admin_login_rate_limits');
}

export async function getCategoriesCollection() {
  const db = await getDb();
  const collection = db.collection<CategoryDocument>('categories');
  await collection.createIndex({ userId: 1, key: 1 });
  return collection;
}

export async function getTransactionsCollection() {
  const db = await getDb();
  const collection = db.collection<TransactionDocument>('transactions');
  await collection.createIndex({ userId: 1, transactionDate: -1 });
  await collection.createIndex({ userId: 1, type: 1, transactionDate: -1 });
  await collection.createIndex({ userId: 1, categoryId: 1 });
  return collection;
}
