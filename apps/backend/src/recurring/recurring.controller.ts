import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateRecurringDto, UpdateRecurringDto } from '@wallet-tree/shared';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { LineUserGuard } from '../auth/line-user.guard';
import { RecurringService } from './recurring.service';

@UseGuards(LineUserGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.recurringService.findAll(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRecurringDto) {
    return this.recurringService.create(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateRecurringDto) {
    return this.recurringService.update(user.userId, id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recurringService.delete(user.userId, id);
  }
}
