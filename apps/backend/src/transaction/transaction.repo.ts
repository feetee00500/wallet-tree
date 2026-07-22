import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CategoryDocument,
  type Filter,
  idFilter,
  ObjectId,
  toCategory,
  toTransaction,
  Transaction,
  TransactionDocument,
  TransactionSource,
} from '@wallet-tree/database';
import { TransactionType } from '@wallet-tree/shared';
import { MongoService } from '../mongo/mongo.service';

interface TransactionFilters {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
}

type TransactionWithCategory = Transaction & { category: { name: string; icon: string } };

@Injectable()
export class TransactionRepo {
  constructor(private readonly mongo: MongoService) {}

  private async transactions() {
    return (await this.mongo.db()).collection<TransactionDocument>('transactions');
  }

  private dateFilter(start?: Date, end?: Date): Filter<TransactionDocument> {
    const range = { ...(start ? { $gte: start } : {}), ...(end ? { $lte: end } : {}) };
    return { $or: [{ transactionDate: range }, { transactionDate: { $exists: false }, createdAt: range }] };
  }

  async findAll(userId: string, filters: TransactionFilters) {
    const { page, limit, startDate, endDate, categoryId, type, search } = filters;
    const clauses: Filter<TransactionDocument>[] = [
      { userId },
      ...(startDate || endDate
        ? [this.dateFilter(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined)]
        : []),
      ...(categoryId ? [{ categoryId }] : []),
      ...(type ? [{ type: { $in: [type, type.toLowerCase()] } }] : []),
      ...(search?.trim() ? [{ $or: [
        { description: { $regex: escapeRegex(search.trim()), $options: 'i' } },
        { note: { $regex: escapeRegex(search.trim()), $options: 'i' } },
      ] }] : []),
    ];
    const query: Filter<TransactionDocument> = { $and: clauses };
    const collection = await this.transactions();
    const [docs, total] = await Promise.all([
      collection.find(query).sort({ transactionDate: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    return { data: docs.map(toTransaction), total, page, limit };
  }

  async findForSummary(userId: string, startDate: Date, endDate: Date): Promise<TransactionWithCategory[]> {
    const docs = await (await this.transactions()).find({ userId, ...this.dateFilter(startDate, endDate) }).sort({ transactionDate: 1, createdAt: 1 }).toArray();
    const categories = await (await this.mongo.db()).collection<CategoryDocument>('categories').find({
      _id: { $in: docs.map((doc) => ObjectId.isValid(doc.categoryId) ? new ObjectId(doc.categoryId) : doc.categoryId) },
    }).toArray();
    const categoryMap = new Map(categories.map((doc) => {
      const category = toCategory(doc);
      return [category.id, { name: category.name, icon: category.icon }];
    }));
    return docs.map((doc) => ({
      ...toTransaction(doc),
      category: categoryMap.get(doc.categoryId) ?? { name: 'ไม่ระบุ', icon: '📌' },
    }));
  }

  async findById(id: string): Promise<Transaction | null> {
    const doc = await (await this.transactions()).findOne(idFilter<TransactionDocument>(id));
    return doc ? toTransaction(doc) : null;
  }

  async create(data: { amount: number; type: TransactionType; description?: string; categoryId: string; userId: string }): Promise<Transaction> {
    const now = new Date();
    const doc: TransactionDocument = {
      _id: new ObjectId(),
      ...data,
      description: data.description ?? null,
      source: TransactionSource.WEB,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.transactions()).insertOne(doc);
    return toTransaction(doc);
  }

  async update(id: string, data: { amount?: number; type?: TransactionType; description?: string; categoryId?: string }): Promise<Transaction> {
    const clean = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    const doc = await (await this.transactions()).findOneAndUpdate(
      idFilter<TransactionDocument>(id),
      { $set: { ...clean, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('Transaction not found');
    return toTransaction(doc);
  }

  async delete(id: string): Promise<Transaction> {
    const doc = await (await this.transactions()).findOneAndDelete(idFilter<TransactionDocument>(id));
    if (!doc) throw new NotFoundException('Transaction not found');
    return toTransaction(doc);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
