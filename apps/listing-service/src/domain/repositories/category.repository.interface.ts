import { CategoryEntity } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
  getCategoryById(id: string): Promise<CategoryEntity | null>;
  getAllCategories(): Promise<Pick<CategoryEntity, 'id'| 'name'>[]>;
  deleteCategoryById(id: string): Promise<CategoryEntity>;
  updateCategoryById(id: string, data: CategoryData): Promise<CategoryEntity>;
  createCategory(name: string): Promise<CategoryEntity>;
}

export interface CategoryData {
  name: string;
}
