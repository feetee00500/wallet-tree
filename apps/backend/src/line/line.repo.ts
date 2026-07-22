import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuthProvider,
  idFilter,
  ObjectId,
  toTransaction,
  toUser,
  Transaction,
  TransactionDocument,
  TransactionSource,
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '@wallet-tree/database';
import { TransactionType } from '@wallet-tree/shared';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class LineRepo {
  constructor(private readonly mongo: MongoService) {}

  async findOrCreateByLineUserId(lineUserId: string): Promise<User> {
    const users = (await this.mongo.db()).collection<UserDocument>('users');
    const now = new Date();
    const doc = await users.findOneAndUpdate(
      { lineUserId },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          displayName: 'LINE User',
          name: 'LINE User',
          authProvider: AuthProvider.LINE,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          failedLoginAttempts: 0,
          sessionVersion: 0,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('User was not created');
    return toUser(doc);
  }

  async createTransaction(data: { amount: number; type: TransactionType; description: string; categoryId: string; userId: string }): Promise<Transaction> {
    const now = new Date();
    const doc: TransactionDocument = {
      _id: new ObjectId(),
      ...data,
      source: TransactionSource.LINE,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.mongo.db()).collection<TransactionDocument>('transactions').insertOne(doc);
    return toTransaction(doc);
  }

  async findLastTransaction(userId: string): Promise<Transaction | null> {
    const doc = await (await this.mongo.db()).collection<TransactionDocument>('transactions').findOne(
      { userId },
      { sort: { transactionDate: -1, createdAt: -1 } },
    );
    return doc ? toTransaction(doc) : null;
  }

  async deleteTransaction(id: string): Promise<Transaction> {
    const doc = await (await this.mongo.db()).collection<TransactionDocument>('transactions').findOneAndDelete(idFilter<TransactionDocument>(id));
    if (!doc) throw new NotFoundException('Transaction not found');
    return toTransaction(doc);
  }

  async sumByPeriod(userId: string, start: Date, end: Date): Promise<{ income: number; expense: number }> {
    const docs = await (await this.mongo.db()).collection<TransactionDocument>('transactions').find({
      userId,
      $or: [
        { transactionDate: { $gte: start, $lt: end } },
        { transactionDate: { $exists: false }, createdAt: { $gte: start, $lt: end } },
      ],
    }).toArray();
    let income = 0;
    let expense = 0;
    for (const doc of docs) {
      if (String(doc.type).toUpperCase() === TransactionType.INCOME) income += Number(doc.amount);
      else expense += Number(doc.amount);
    }
    return { income, expense };
  }
}
