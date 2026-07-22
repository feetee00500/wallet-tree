import { Db, MongoClient, ObjectId, type Filter } from 'mongodb';

export { Db, MongoClient, ObjectId } from 'mongodb';
export type { Filter } from 'mongodb';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionSource {
  WEB = 'WEB',
  LINE = 'LINE',
  RECURRING = 'RECURRING',
}

export enum AuthProvider {
  LINE = 'LINE',
  LOCAL_ADMIN = 'LOCAL_ADMIN',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export type MongoId = ObjectId | string;

export interface UserDocument {
  _id: MongoId;
  email?: string | null;
  emailNormalized?: string | null;
  username?: string | null;
  usernameNormalized?: string | null;
  passwordHash?: string | null;
  name?: string;
  displayName?: string;
  pictureUrl?: string | null;
  lineUserId?: string | null;
  authProvider?: string;
  role?: string;
  status?: string;
  mustChangePassword?: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  sessionVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryDocument {
  _id: MongoId;
  name?: string;
  nameTh?: string;
  nameEn?: string;
  icon: string;
  type: string;
  userId: string | null;
  isArchived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionDocument {
  _id: MongoId;
  amount: number;
  type: string;
  description?: string | null;
  note?: string | null;
  source?: string;
  userId: string;
  categoryId: string;
  transactionDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecurringDocument {
  _id: MongoId;
  amount: number;
  type: string;
  description?: string | null;
  categoryId: string;
  userId: string;
  dayOfMonth: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetDocument {
  _id: MongoId;
  amount: number;
  categoryId: string;
  userId: string;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string | null;
  username: string | null;
  passwordHash: string | null;
  name: string;
  pictureUrl: string | null;
  lineUserId: string | null;
  authProvider: AuthProvider;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  source: TransactionSource;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recurring {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  categoryId: string;
  userId: string;
  dayOfMonth: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  amount: number;
  categoryId: string;
  userId: string;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export function idFilter<T extends { _id: MongoId }>(id: string): Filter<T> {
  return { _id: ObjectId.isValid(id) ? new ObjectId(id) : id } as Filter<T>;
}

export function normalizeType(value: string): TransactionType {
  return value.toUpperCase() === TransactionType.INCOME
    ? TransactionType.INCOME
    : TransactionType.EXPENSE;
}

export function toUser(doc: UserDocument): User {
  const provider = String(doc.authProvider ?? '').toUpperCase();
  return {
    id: doc._id.toString(),
    email: doc.email ?? null,
    username: doc.usernameNormalized ?? doc.username?.trim().toLowerCase() ?? null,
    passwordHash: doc.passwordHash ?? null,
    name: doc.name ?? doc.displayName ?? 'LINE User',
    pictureUrl: doc.pictureUrl ?? null,
    lineUserId: doc.lineUserId ?? null,
    authProvider:
      provider === AuthProvider.LINE || (!provider && Boolean(doc.lineUserId))
        ? AuthProvider.LINE
        : AuthProvider.LOCAL_ADMIN,
    role: String(doc.role ?? '').toUpperCase() === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
    status:
      String(doc.status ?? 'ACTIVE').toUpperCase() === UserStatus.DISABLED
        ? UserStatus.DISABLED
        : UserStatus.ACTIVE,
    mustChangePassword: doc.mustChangePassword ?? false,
    failedLoginAttempts: doc.failedLoginAttempts ?? 0,
    lockedUntil: doc.lockedUntil ?? null,
    lastLoginAt: doc.lastLoginAt ?? null,
    sessionVersion: doc.sessionVersion ?? 0,
    createdAt: doc.createdAt ?? new Date(0),
    updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date(0),
  };
}

export function toCategory(doc: CategoryDocument): Category {
  return {
    id: doc._id.toString(),
    name: doc.name ?? doc.nameTh ?? doc.nameEn ?? 'ไม่ระบุ',
    icon: doc.icon,
    type: normalizeType(doc.type),
    userId: doc.userId ?? null,
    createdAt: doc.createdAt ?? new Date(0),
    updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date(0),
  };
}

export function toTransaction(doc: TransactionDocument): Transaction {
  return {
    id: doc._id.toString(),
    amount: Number(doc.amount),
    type: normalizeType(doc.type),
    description: doc.description ?? doc.note ?? null,
    source: String(doc.source ?? 'WEB').toUpperCase() as TransactionSource,
    categoryId: doc.categoryId,
    userId: doc.userId,
    createdAt: doc.transactionDate ?? doc.createdAt ?? new Date(0),
    updatedAt: doc.updatedAt ?? doc.createdAt ?? doc.transactionDate ?? new Date(0),
  };
}

export function toRecurring(doc: RecurringDocument): Recurring {
  return {
    id: doc._id.toString(),
    amount: Number(doc.amount),
    type: normalizeType(doc.type),
    description: doc.description ?? null,
    categoryId: doc.categoryId,
    userId: doc.userId,
    dayOfMonth: doc.dayOfMonth,
    active: doc.active,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function toBudget(doc: BudgetDocument): Budget {
  return { ...doc, id: doc._id.toString() };
}

export async function ensureMongoIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection<UserDocument>('users').createIndex(
      { lineUserId: 1 },
      {
        unique: true,
        partialFilterExpression: { lineUserId: { $type: 'string' } },
        name: 'users_lineUserId_unique',
      },
    ),
    db.collection<UserDocument>('users').createIndex(
      { usernameNormalized: 1 },
      {
        unique: true,
        partialFilterExpression: { usernameNormalized: { $type: 'string' } },
        name: 'users_username_unique',
      },
    ),
    db.collection<CategoryDocument>('categories').createIndex(
      { userId: 1, type: 1 },
      { name: 'categories_user_type' },
    ),
    db.collection<TransactionDocument>('transactions').createIndex(
      { userId: 1, transactionDate: -1 },
      { name: 'transactions_user_date' },
    ),
    db.collection<TransactionDocument>('transactions').createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'transactions_user_created' },
    ),
    db.collection<RecurringDocument>('recurrings').createIndex(
      { active: 1, dayOfMonth: 1 },
      { name: 'recurrings_schedule' },
    ),
    db.collection<BudgetDocument>('budgets').createIndex(
      { userId: 1, categoryId: 1, month: 1, year: 1 },
      { unique: true, name: 'budgets_period_unique' },
    ),
  ]);
}
