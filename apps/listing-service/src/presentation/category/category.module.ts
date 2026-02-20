import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

@Module({
  controllers: [CategoryController],
  providers: [
    CategoryService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
