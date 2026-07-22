import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuthProvider,
  idFilter,
  ObjectId,
  toUser,
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '@wallet-tree/database';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class AuthRepo {
  constructor(private readonly mongo: MongoService) {}

  private async users() {
    return (await this.mongo.db()).collection<UserDocument>('users');
  }

  async findById(id: string): Promise<User | null> {
    const doc = await (await this.users()).findOne(idFilter<UserDocument>(id));
    return doc ? toUser(doc) : null;
  }

  async findAdminByUsername(username: string): Promise<User | null> {
    const normalized = username.trim().toLocaleLowerCase('en-US');
    const doc = await (await this.users()).findOne({
      $and: [
        { $or: [{ usernameNormalized: normalized }, { username: normalized }] },
        { $or: [{ authProvider: AuthProvider.LOCAL_ADMIN }, { authProvider: 'local_admin' }, { authProvider: 'local' }] },
        { $or: [{ role: UserRole.ADMIN }, { role: 'admin' }] },
      ],
    });
    return doc ? toUser(doc) : null;
  }

  async findByLineUserId(lineUserId: string): Promise<User | null> {
    const doc = await (await this.users()).findOne({ lineUserId });
    return doc ? toUser(doc) : null;
  }

  async upsertLineUser(profile: {
    lineUserId: string;
    name: string;
    pictureUrl?: string;
  }): Promise<User> {
    const now = new Date();
    const doc = await (await this.users()).findOneAndUpdate(
      { lineUserId: profile.lineUserId },
      {
        $set: {
          name: profile.name,
          displayName: profile.name,
          ...(profile.pictureUrl ? { pictureUrl: profile.pictureUrl } : {}),
          updatedAt: now,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          authProvider: AuthProvider.LINE,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          failedLoginAttempts: 0,
          sessionVersion: 0,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('User was not created');
    return toUser(doc);
  }

  async recordAdminLogin(userId: string): Promise<User> {
    const doc = await (await this.users()).findOneAndUpdate(
      idFilter<UserDocument>(userId),
      { $set: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new NotFoundException('User not found');
    return toUser(doc);
  }

  async recordAdminFailure(user: User, maxAttempts: number, lockoutMinutes: number): Promise<void> {
    const failures = user.failedLoginAttempts + 1;
    await (await this.users()).updateOne(idFilter<UserDocument>(user.id), {
      $set: {
        failedLoginAttempts: failures,
        lockedUntil: failures >= maxAttempts
          ? new Date(Date.now() + lockoutMinutes * 60_000)
          : null,
        updatedAt: new Date(),
      },
    });
  }
}
