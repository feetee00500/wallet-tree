import { Injectable } from '@nestjs/common';
import { AuthProvider, type UserDocument, UserRole } from '@wallet-tree/database';
import type { AdminOverviewResponse, AdminUserResponse } from '@wallet-tree/shared';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class AdminService {
  constructor(private readonly mongo: MongoService) {}

  async overview(): Promise<AdminOverviewResponse> {
    const db = await this.mongo.db();
    const users = db.collection<UserDocument>('users');
    const [
      userCount,
      lineUsers,
      administrators,
      transactions,
      categories,
      recurringRules,
      budgets,
    ] = await Promise.all([
      users.countDocuments(),
      users.countDocuments({ authProvider: AuthProvider.LINE }),
      users.countDocuments({ role: UserRole.ADMIN }),
      db.collection('transactions').countDocuments(),
      db.collection('categories').countDocuments(),
      db.collection('recurrings').countDocuments(),
      db.collection('budgets').countDocuments(),
    ]);

    return {
      users: userCount,
      lineUsers,
      administrators,
      transactions,
      categories,
      recurringRules,
      budgets,
      generatedAt: new Date().toISOString(),
    };
  }

  async users(): Promise<AdminUserResponse[]> {
    const db = await this.mongo.db();
    const documents = await db
      .collection<UserDocument>('users')
      .find({}, { projection: { passwordHash: 0, sessionVersion: 0, lineUserId: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return documents.map((user) => ({
      id: user._id.toString(),
      name: user.displayName || user.name || user.username || 'Unknown user',
      username: user.username || null,
      pictureUrl: user.pictureUrl || null,
      authProvider: user.authProvider || 'UNKNOWN',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt?.toISOString() || new Date(0).toISOString(),
    }));
  }
}
