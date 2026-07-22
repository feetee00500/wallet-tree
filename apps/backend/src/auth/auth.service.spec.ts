import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthProvider, UserRole, UserStatus, type User } from '@wallet-tree/database';
import { hash } from 'bcryptjs';
import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';

const admin = (passwordHash: string): User => ({
  id: 'admin-1',
  email: null,
  username: 'admin',
  passwordHash,
  name: 'Admin',
  pictureUrl: null,
  lineUserId: null,
  authProvider: AuthProvider.LOCAL_ADMIN,
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  mustChangePassword: false,
  failedLoginAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
  sessionVersion: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AuthService provider separation', () => {
  let service: AuthService;
  let repo: jest.Mocked<AuthRepo>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepo,
          useValue: {
            findAdminByUsername: jest.fn(),
            recordAdminFailure: jest.fn(),
            recordAdminLogin: jest.fn(),
            findById: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn().mockReturnValue('a-secret-value-with-at-least-32-chars'),
          },
        },
      ],
    }).compile();
    service = module.get(AuthService);
    repo = module.get(AuthRepo);
    jwt = module.get(JwtService);
  });

  it('authenticates only a local admin with a matching password', async () => {
    const user = admin(await hash('correct-password', 4));
    repo.findAdminByUsername.mockResolvedValue(user);
    repo.recordAdminLogin.mockResolvedValue(user);
    await expect(
      service.loginAdmin({ username: 'admin', password: 'correct-password' }),
    ).resolves.toEqual({ accessToken: 'token' });
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'LOCAL_ADMIN', role: 'ADMIN' }),
    );
  });

  it('rejects invalid local credentials with a generic error', async () => {
    repo.findAdminByUsername.mockResolvedValue(null);
    await expect(
      service.loginAdmin({ username: 'missing', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('signs and verifies a browser-bound LINE OAuth state', () => {
    const state = service.createLineState();
    expect(service.verifyLineState(state, state)).toBe(true);
    expect(service.verifyLineState(state, `${state}x`)).toBe(false);
  });
});
