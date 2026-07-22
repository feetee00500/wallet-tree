import { Module } from '@nestjs/common';
import { CategoryModule } from '../category/category.module';
import { AutoCategorizerService } from './categorizer/auto-categorizer.service';
import { LineController } from './line.controller';
import { LineRepo } from './line.repo';
import { LineService } from './line.service';
import { LineSignatureGuard } from './line-signature.guard';

@Module({
  imports: [CategoryModule],
  controllers: [LineController],
  providers: [LineService, LineSignatureGuard, AutoCategorizerService, LineRepo],
})
export class LineModule {}
