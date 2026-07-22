import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Budget,
  BudgetDocument,
  CategoryDocument,
  idFilter,
  ObjectId,
  toBudget,
  toCategory,
  TransactionDocument,
} from '@wallet-tree/database';
import { monthRange } from '../common/date-range';
import { MongoService } from '../mongo/mongo.service';

type BudgetWithCategory = Budget & { category: { name: string; icon: string } };
type SpentRow = { categoryId: string; amount: number };

@Injectable()
export class BudgetRepo {
  constructor(private readonly mongo: MongoService) {}

  private async budgets() {
    return (await this.mongo.db()).collection<BudgetDocument>('budgets');
  }

  async findBudgetsWithCategory(userId: string, month: number, year: number): Promise<BudgetWithCategory[]> {
    const docs = await (await this.budgets()).find({ userId, month, year }).toArray();
    return Promise.all(docs.map(async (doc) => {
      const categoryDoc = await (await this.mongo.db()).collection<CategoryDocument>('categories').findOne(idFilter<CategoryDocument>(doc.categoryId));
      const category = categoryDoc ? toCategory(categoryDoc) : null;
      return { ...toBudget(doc), category: { name: category?.name ?? 'ไม่ระบุ', icon: category?.icon ?? '📌' } };
    }));
  }

  async findSpentByCategory(userId: string, month: number, year: number, categoryIds: string[]): Promise<SpentRow[]> {
    const { start, end } = monthRange(month, year);
    const docs = await (await this.mongo.db()).collection<TransactionDocument>('transactions').find({
      userId,
      type: { $in: ['EXPENSE', 'expense'] },
      categoryId: { $in: categoryIds },
      $or: [
        { transactionDate: { $gte: start, $lte: end } },
        { transactionDate: { $exists: false }, createdAt: { $gte: start, $lte: end } },
      ],
    }).toArray();
    const sums = new Map<string, number>();
    for (const doc of docs) sums.set(doc.categoryId, (sums.get(doc.categoryId) ?? 0) + Number(doc.amount));
    return Array.from(sums, ([categoryId, amount]) => ({ categoryId, amount }));
  }

  async findById(id: string): Promise<Budget | null> {
    const doc = await (await this.budgets()).findOne(idFilter<BudgetDocument>(id));
    return doc ? toBudget(doc) : null;
  }

  async findByConstraint(userId: string, categoryId: string, month: number, year: number): Promise<Budget | null> {
    const doc = await (await this.budgets()).findOne({ userId, categoryId, month, year });
    return doc ? toBudget(doc) : null;
  }

  async create(data: { amount: number; categoryId: string; userId: string; month: number; year: number }): Promise<Budget> {
    const now = new Date();
    const doc: BudgetDocument = { _id: new ObjectId(), ...data, createdAt: now, updatedAt: now };
    await (await this.budgets()).insertOne(doc);
    return toBudget(doc);
  }

  async update(id: string, amount: number): Promise<Budget> {
    const doc = await (await this.budgets()).findOneAndUpdate(
      idFilter<BudgetDocument>(id),
      { $set: { amount, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('Budget not found');
    return toBudget(doc);
  }

  async delete(id: string): Promise<Budget> {
    const doc = await (await this.budgets()).findOneAndDelete(idFilter<BudgetDocument>(id));
    if (!doc) throw new NotFoundException('Budget not found');
    return toBudget(doc);
  }
}
