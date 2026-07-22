import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Category,
  CategoryDocument,
  idFilter,
  ObjectId,
  toCategory,
  TransactionDocument,
} from '@wallet-tree/database';
import { TransactionType } from '@wallet-tree/shared';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class CategoryRepo {
  constructor(private readonly mongo: MongoService) {}

  private async categories() {
    return (await this.mongo.db()).collection<CategoryDocument>('categories');
  }

  async findAllForUser(userId: string, type?: TransactionType): Promise<Category[]> {
    const docs = await (await this.categories()).find({
      userId: { $in: [null, userId] },
      ...(type ? { type: { $in: [type, type.toLowerCase()] } } : {}),
      isArchived: { $ne: true },
    }).sort({ createdAt: 1, order: 1 }).toArray();
    return docs.map(toCategory);
  }

  async findById(id: string): Promise<Category | null> {
    const doc = await (await this.categories()).findOne(idFilter<CategoryDocument>(id));
    return doc ? toCategory(doc) : null;
  }

  async create(data: { name: string; icon: string; type: TransactionType; userId: string }): Promise<Category> {
    const now = new Date();
    const doc: CategoryDocument = {
      _id: new ObjectId(),
      name: data.name,
      nameTh: data.name,
      nameEn: data.name,
      icon: data.icon,
      type: data.type,
      userId: data.userId,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.categories()).insertOne(doc);
    return toCategory(doc);
  }

  async update(id: string, data: { name?: string; icon?: string }): Promise<Category> {
    const doc = await (await this.categories()).findOneAndUpdate(
      idFilter<CategoryDocument>(id),
      { $set: { ...data, ...(data.name ? { nameTh: data.name, nameEn: data.name } : {}), updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('Category not found');
    return toCategory(doc);
  }

  async delete(id: string): Promise<Category> {
    const doc = await (await this.categories()).findOneAndDelete(idFilter<CategoryDocument>(id));
    if (!doc) throw new NotFoundException('Category not found');
    return toCategory(doc);
  }

  async hasTransactions(categoryId: string): Promise<boolean> {
    return (await this.mongo.db()).collection<TransactionDocument>('transactions').countDocuments({ categoryId }, { limit: 1 }).then((count) => count > 0);
  }
}
