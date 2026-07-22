import { Injectable } from '@nestjs/common';
import {
  AuthProvider,
  Transaction,
  TransactionSource,
  User,
  UserRole,
  UserStatus,
} from '@wallet-tree/database';
import { TransactionType } from '@wallet-tree/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LineRepo {
  constructor(private readonly prisma: PrismaService) {}

  findOrCreateByLineUserId(lineUserId: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { lineUserId },
      update: {},
      create: {
        lineUserId,
        name: 'LINE User',
        authProvider: AuthProvider.LINE,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    });
  }

  createTransaction(data: {
    amount: number;
    type: TransactionType;
    description: string;
    categoryId: string;
    userId: string;
  }): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: { ...data, source: TransactionSource.LINE },
    });
  }

  findLastTransaction(userId: string): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  deleteTransaction(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id } });
  }

  async sumByPeriod(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<{ income: number; expense: number }> {
    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const income = Number(rows.find((r) => r.type === 'INCOME')?._sum.amount ?? 0);
    const expense = Number(rows.find((r) => r.type === 'EXPENSE')?._sum.amount ?? 0);
    return { income, expense };
  }
}
