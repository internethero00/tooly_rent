import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, AuthGuard, RolesGuard],
  exports: [CategoryService],
})
export class CategoryModule {}
