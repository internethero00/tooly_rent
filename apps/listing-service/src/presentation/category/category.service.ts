import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  CategoryData,
} from '../../domain/repositories/category.repository.interface';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CategoryEntity } from '../../domain/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}
  async getCategoryById(id: string): Promise<CategoryEntity | null> {
    const category = await this.categoryRepository.getCategoryById(id);
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }

  async deleteCategoryById(id: string): Promise<CategoryEntity> {
    try {
      return await this.categoryRepository.deleteCategoryById(id);
    } catch {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  }

  async updateCategoryById(
    id: string,
    data: CategoryData,
  ): Promise<CategoryEntity> {
    try {
      return await this.categoryRepository.updateCategoryById(id, data);
    } catch {
      throw new NotFoundException(`Categories with id ${id} not found`);
    }
  }

  async createCategory(data: CategoryData): Promise<CategoryEntity> {
    return await this.categoryRepository.createCategory(data);
  }

  async getAllCategories(): Promise<CategoryEntity[]> {
    const categories = await this.categoryRepository.getAllCategories();
    if (!categories) throw new NotFoundException(`Categories not found`);
    return categories;
  }
}
