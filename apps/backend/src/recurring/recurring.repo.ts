import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CategoryDocument,
  idFilter,
  ObjectId,
  Recurring,
  RecurringDocument,
  toCategory,
  toRecurring,
  toTransaction,
  Transaction,
  TransactionDocument,
  TransactionSource,
} from '@wallet-tree/database';
import { TransactionType } from '@wallet-tree/shared';
import { MongoService } from '../mongo/mongo.service';

type RecurringWithCategory = Recurring & { category: { name: string; icon: string } };

@Injectable()
export class RecurringRepo {
  constructor(private readonly mongo: MongoService) {}

  private async recurrings() {
    return (await this.mongo.db()).collection<RecurringDocument>('recurrings');
  }

  private async withCategory(doc: RecurringDocument): Promise<RecurringWithCategory> {
    const categoryDoc = await (await this.mongo.db()).collection<CategoryDocument>('categories').findOne(idFilter<CategoryDocument>(doc.categoryId));
    const category = categoryDoc ? toCategory(categoryDoc) : null;
    return { ...toRecurring(doc), category: { name: category?.name ?? 'ไม่ระบุ', icon: category?.icon ?? '📌' } };
  }

  async findAll(userId: string): Promise<RecurringWithCategory[]> {
    const docs = await (await this.recurrings()).find({ userId }).sort({ createdAt: -1 }).toArray();
    return Promise.all(docs.map((doc) => this.withCategory(doc)));
  }

  async findById(id: string): Promise<Recurring | null> {
    const doc = await (await this.recurrings()).findOne(idFilter<RecurringDocument>(id));
    return doc ? toRecurring(doc) : null;
  }

  async findActiveByDayOfMonth(dayOfMonth: number): Promise<Recurring[]> {
    const docs = await (await this.recurrings()).find({ active: true, dayOfMonth }).toArray();
    return docs.map(toRecurring);
  }

  async create(data: { amount: number; type: TransactionType; description?: string; categoryId: string; userId: string; dayOfMonth: number }): Promise<RecurringWithCategory> {
    const now = new Date();
    const doc: RecurringDocument = {
      _id: new ObjectId(),
      ...data,
      description: data.description ?? null,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.recurrings()).insertOne(doc);
    return this.withCategory(doc);
  }

  async update(id: string, data: { amount?: number; type?: TransactionType; description?: string; categoryId?: string; dayOfMonth?: number; active?: boolean }): Promise<RecurringWithCategory> {
    const clean = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    const doc = await (await this.recurrings()).findOneAndUpdate(
      idFilter<RecurringDocument>(id),
      { $set: { ...clean, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('Recurring not found');
    return this.withCategory(doc);
  }

  async delete(id: string): Promise<Recurring> {
    const doc = await (await this.recurrings()).findOneAndDelete(idFilter<RecurringDocument>(id));
    if (!doc) throw new NotFoundException('Recurring not found');
    return toRecurring(doc);
  }

  async createTransaction(data: { amount: number; type: TransactionType; description?: string; categoryId: string; userId: string }): Promise<Transaction> {
    const now = new Date();
    const doc: TransactionDocument = {
      _id: new ObjectId(),
      ...data,
      description: data.description ?? null,
      source: TransactionSource.RECURRING,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.mongo.db()).collection<TransactionDocument>('transactions').insertOne(doc);
    return toTransaction(doc);
  }

  async hasRecurringTransactionToday(userId: string, categoryId: string, amount: number): Promise<boolean> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const count = await (await this.mongo.db()).collection<TransactionDocument>('transactions').countDocuments({
      userId,
      categoryId,
      amount,
      source: { $in: [TransactionSource.RECURRING, 'recurring'] },
      $or: [
        { transactionDate: { $gte: startOfToday } },
        { transactionDate: { $exists: false }, createdAt: { $gte: startOfToday } },
      ],
    }, { limit: 1 });
    return count > 0;
  }
}
