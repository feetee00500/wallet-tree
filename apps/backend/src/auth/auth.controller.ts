import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AdminLoginDto } from '@wallet-tree/shared';
import { AuthService } from './auth.service';
import { AuthUser, CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

const LINE_STATE_COOKIE = 'wallet-tree-line-state';

function cookieValue(request: Request, name: string): string | undefined {
  const cookies = request.headers.cookie?.split(';') || [];
  const entry = cookies.map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('line')
  line(@Res() response: Response) {
    const state = this.authService.createLineState();
    response.cookie(LINE_STATE_COOKIE, state, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/api/auth/line/callback',
    });
    return response.redirect(this.authService.lineAuthorizationUrl(state));
  }

  @Get('line/callback')
  async lineCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const frontend = this.config.getOrThrow<string>('FRONTEND_URL');
    const storedState = cookieValue(request, LINE_STATE_COOKIE);
    response.clearCookie(LINE_STATE_COOKIE, { path: '/api/auth/line/callback' });
    if (!code || !this.authService.verifyLineState(state, storedState)) {
      return response.redirect(`${frontend}/auth/callback#error=line_login_failed`);
    }
    try {
      const result = await this.authService.loginWithLineCode(code);
      return response.redirect(
        `${frontend}/auth/callback#token=${encodeURIComponent(result.accessToken)}`,
      );
    } catch {
      return response.redirect(`${frontend}/auth/callback#error=line_login_failed`);
    }
  }

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.userId);
  }
}
