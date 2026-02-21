
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryData,
  ICategoryRepository,
} from '../../domain/repositories/category.repository.interface';
import { CategoryEntity } from '../../domain/entities/category.entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async getCategoryById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });
    return category ? this.mapToEntity(category) : null;
  }
  async getAllCategories(): Promise<Pick<CategoryEntity, 'id' | 'name'>[]> {
    const categories = await this.prismaService.category.findMany();
    return categories.map((category) => ({id: category.id, name: category.name}));
  }
  async deleteCategoryById(id: string): Promise<CategoryEntity> {
    const deleted = await this.prismaService.category.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }
  async updateCategoryById(
    id: string,
    data: CategoryData,
  ): Promise<CategoryEntity> {
    const updated = await this.prismaService.category.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
    return this.mapToEntity(updated);
  }
  async createCategory(name: string): Promise<CategoryEntity> {
    const newCategory = await this.prismaService.category.create({
      data: {
        name,
      },
    });

    return this.mapToEntity(newCategory);
  }

  private mapToEntity(prismaCategory: any): CategoryEntity {
    return new CategoryEntity({
      id: prismaCategory.id,
      name: prismaCategory.name,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    });
  }
}
