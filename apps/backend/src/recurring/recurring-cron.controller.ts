import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecurringService } from './recurring.service';

@Controller('cron/recurring')
export class RecurringCronController {
  constructor(
    private readonly config: ConfigService,
    private readonly recurringService: RecurringService,
  ) {}

  @Get()
  async process(@Headers('authorization') authorization?: string) {
    const secret = this.config.getOrThrow<string>('CRON_SECRET');
    if (authorization !== `Bearer ${secret}`) {
      throw new UnauthorizedException();
    }

    await this.recurringService.processRecurring();
    return { ok: true };
  }
}
