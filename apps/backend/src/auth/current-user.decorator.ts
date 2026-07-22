import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface AuthUser {
  userId: string;
  authProvider: 'LINE' | 'LOCAL_ADMIN';
  role: 'USER' | 'ADMIN';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return req.user;
  },
);
