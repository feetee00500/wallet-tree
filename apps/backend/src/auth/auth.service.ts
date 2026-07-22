import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, User, UserRole, UserStatus } from '@wallet-tree/database';
import type { AdminLoginDto, AuthResponse, UserProfile } from '@wallet-tree/shared';
import { compare } from 'bcryptjs';
import { AuthRepo } from './auth.repo';

type LineProfile = {
  userId: string;
  displayName?: string;
  pictureUrl?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  createLineState(): string {
    const nonce = randomBytes(32).toString('base64url');
    return `${nonce}.${this.signState(nonce)}`;
  }

  verifyLineState(state: string | undefined, cookieState: string | undefined): boolean {
    if (!state || !cookieState || state !== cookieState) return false;
    const [nonce, supplied, extra] = state.split('.');
    if (!nonce || !supplied || extra) return false;
    const expected = Buffer.from(this.signState(nonce), 'base64url');
    const received = Buffer.from(supplied, 'base64url');
    return expected.length === received.length && timingSafeEqual(expected, received);
  }

  lineAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.getOrThrow<string>('LINE_LOGIN_CHANNEL_ID'),
      redirect_uri: this.config.getOrThrow<string>('LINE_LOGIN_CALLBACK_URL'),
      state,
      scope: 'profile openid',
    });
    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  async loginWithLineCode(code: string): Promise<AuthResponse> {
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.getOrThrow<string>('LINE_LOGIN_CALLBACK_URL'),
        client_id: this.config.getOrThrow<string>('LINE_LOGIN_CHANNEL_ID'),
        client_secret: this.config.getOrThrow<string>('LINE_LOGIN_CHANNEL_SECRET'),
      }),
    });
    if (!tokenResponse.ok) throw new UnauthorizedException('LINE login failed');
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) throw new UnauthorizedException('LINE login failed');

    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!profileResponse.ok) throw new UnauthorizedException('LINE login failed');
    const profile = (await profileResponse.json()) as LineProfile;
    if (!profile.userId) throw new UnauthorizedException('LINE login failed');

    const existing = await this.authRepo.findByLineUserId(profile.userId);
    if (
      existing &&
      (existing.authProvider !== AuthProvider.LINE ||
        existing.role !== UserRole.USER ||
        existing.status !== UserStatus.ACTIVE)
    ) {
      throw new ForbiddenException('Account unavailable');
    }
    const user = await this.authRepo.upsertLineUser({
      lineUserId: profile.userId,
      name: profile.displayName || 'LINE User',
      pictureUrl: profile.pictureUrl,
    });
    return { accessToken: this.issueToken(user) };
  }

  async loginAdmin(dto: AdminLoginDto): Promise<AuthResponse> {
    const user = await this.authRepo.findAdminByUsername(dto.username);
    const maxAttempts = Number(this.config.get('ADMIN_LOGIN_MAX_ATTEMPTS') || 5);
    const lockoutMinutes = Number(this.config.get('ADMIN_LOGIN_LOCKOUT_MINUTES') || 15);
    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !user.passwordHash ||
      (user.lockedUntil && user.lockedUntil > new Date())
    ) {
      throw new UnauthorizedException('Invalid credentials or account unavailable');
    }
    if (!(await compare(dto.password, user.passwordHash))) {
      await this.authRepo.recordAdminFailure(user, maxAttempts, lockoutMinutes);
      throw new UnauthorizedException('Invalid credentials or account unavailable');
    }
    const authenticated = await this.authRepo.recordAdminLogin(user.id);
    return { accessToken: this.issueToken(authenticated) };
  }

  async validateTokenUser(userId: string, sessionVersion: number): Promise<User> {
    const user = await this.authRepo.findById(userId);
    if (!user || user.status !== UserStatus.ACTIVE || user.sessionVersion !== sessionVersion) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      pictureUrl: user.pictureUrl,
      authProvider: user.authProvider,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };
  }

  private issueToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      provider: user.authProvider,
      role: user.role,
      version: user.sessionVersion,
    });
  }

  private signState(nonce: string): string {
    const secret = this.config.get<string>('LINE_STATE_SECRET') || this.config.getOrThrow<string>('JWT_SECRET');
    return createHmac('sha256', secret).update(nonce).digest('base64url');
  }
}
