import type {
  AuthProvider,
  UserDocument,
  UserRole,
} from '@/lib/db/models';

export function resolveAuthProvider(
  user: Pick<UserDocument, 'authProvider' | 'lineUserId'>
): AuthProvider {
  if (user.authProvider === 'local_admin') return 'local_admin';
  return 'line';
}

export function resolveUserRole(
  user: Pick<UserDocument, 'role'>
): UserRole {
  return user.role === 'admin' ? 'admin' : 'user';
}

export function isUserActive(
  user: Pick<UserDocument, 'status'>
): boolean {
  return user.status !== 'disabled';
}

export function normalizeAdminIdentifier(value: string): string {
  return value.trim().normalize('NFKC').toLocaleLowerCase('en-US');
}

export function publicUser(user: UserDocument) {
  return {
    _id: user._id.toString(),
    authProvider: resolveAuthProvider(user),
    role: resolveUserRole(user),
    status: isUserActive(user) ? 'active' as const : 'disabled' as const,
    lineUserId: user.lineUserId,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    pictureUrl: user.pictureUrl,
    preferredCurrency: user.preferredCurrency,
    timezone: user.timezone,
    language: user.language,
    mustChangePassword: user.mustChangePassword === true,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastActiveAt: user.lastActiveAt?.toISOString(),
  };
}
