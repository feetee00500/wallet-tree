import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto, GetCategoriesQueryDto, UpdateCategoryDto } from '@wallet-tree/shared';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { LineUserGuard } from '../auth/line-user.guard';
import { CategoryService } from './category.service';

@UseGuards(LineUserGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: GetCategoriesQueryDto) {
    return this.categoryService.findAll(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.categoryService.create(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(user.userId, id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.categoryService.delete(user.userId, id);
  }
}
