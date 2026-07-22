import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthUser } from './current-user.decorator';

@Injectable()
export class LineUserGuard extends JwtAuthGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) return false;
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    if (request.user.authProvider !== 'LINE' || request.user.role !== 'USER') {
      throw new ForbiddenException('LINE user access required');
    }
    return true;
  }
}
