import { Injectable } from '@nestjs/common';
import { AuthProvider, User, UserRole, UserStatus } from '@wallet-tree/database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepo {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAdminByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username: username.trim().toLocaleLowerCase('en-US'),
        authProvider: AuthProvider.LOCAL_ADMIN,
        role: UserRole.ADMIN,
      },
    });
  }

  findByLineUserId(lineUserId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { lineUserId } });
  }

  upsertLineUser(profile: {
    lineUserId: string;
    name: string;
    pictureUrl?: string;
  }): Promise<User> {
    return this.prisma.user.upsert({
      where: { lineUserId: profile.lineUserId },
      update: {
        name: profile.name,
        pictureUrl: profile.pictureUrl,
      },
      create: {
        lineUserId: profile.lineUserId,
        name: profile.name,
        pictureUrl: profile.pictureUrl,
        authProvider: AuthProvider.LINE,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    });
  }

  recordAdminLogin(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  async recordAdminFailure(
    user: User,
    maxAttempts: number,
    lockoutMinutes: number,
  ): Promise<void> {
    const failures = user.failedLoginAttempts + 1;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failures,
        lockedUntil:
          failures >= maxAttempts
            ? new Date(Date.now() + lockoutMinutes * 60_000)
            : null,
      },
    });
  }
}
