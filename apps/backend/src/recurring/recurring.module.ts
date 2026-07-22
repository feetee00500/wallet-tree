import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { RecurringCronController } from './recurring-cron.controller';
import { RecurringController } from './recurring.controller';
import { RecurringRepo } from './recurring.repo';
import { RecurringService } from './recurring.service';

@Module({
  imports: [AuthModule, CategoryModule],
  controllers: [RecurringController, RecurringCronController],
  providers: [RecurringService, RecurringRepo],
})
export class RecurringModule {}
