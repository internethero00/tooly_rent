import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Message, RMQMessage, RMQRoute } from 'nestjs-rmq';
import {
  createCategory, deleteCategoryById,
  getAllCategory,
  getCategoryById,
  updateCategoryById,
} from '@tooly-rent/contracts';
import { LoggerService } from '@tooly-rent/common';

@Controller()
export class CategoryController {
  private readonly logger = new LoggerService(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {}

  @RMQRoute(createCategory.topic)
  async createCategory(dto: createCategory.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Category Service] creating category`);

    try {
      const category = await this.categoryService.createCategory(dto.name);
      if (category) {
        return { id: category.id, name: category.name };
      }
    } catch (e) {
      this.logger.error(
        `[${requestId}][Category Service] creating category failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(getCategoryById.topic)
  async getCategoryById(
    { categoryId }: getCategoryById.Request,
    @RMQMessage msg: Message,
  ) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][Category Service] get category by id ${categoryId}`,
    );

    try {
      const {id, name} = await this.categoryService.getCategoryById(categoryId);
      this.logger.log(
        `[${requestId}][Category Service] getting category by id ${categoryId} successfully`,
      );
      return {
        id, name
      }
    } catch (e) {
      this.logger.error(
        `[${requestId}][Category Service] getting category failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(getAllCategory.topic)
  async getAllCategories(@RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Category Service] get all categories`);

    try {
      return await this.categoryService.getAllCategories();
    } catch (e) {
      this.logger.error(
        `[${requestId}][Category Service] getting categories failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(updateCategoryById.topic)
  async updateCategoryById(
    { categoryId, name }: updateCategoryById.Request,
    @RMQMessage msg: Message,
  ) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][Category Service] update category by id ${categoryId}`,
    );

    try {
      return await this.categoryService.updateCategoryById(categoryId, {
        name,
      });
    } catch (e) {
      this.logger.error(
        `[${requestId}][Category Service] update category by id ${categoryId} failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(deleteCategoryById.topic)
  async deleteCategoryById({categoryId}: deleteCategoryById.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][Category Service] delete category by id ${categoryId}`,
    );
    try {
      const {id, name} = await this.categoryService.deleteCategoryById(categoryId);
      this.logger.log(
        `[${requestId}][Category Service] delete category by id ${categoryId} successfully`,
      );
      return {
        id, name
      }
    } catch (e) {
      this.logger.error(
        `[${requestId}][Category Service] delete category by id ${categoryId} failed:`,
        e.message,
      );
      throw e;
    }
  }
}
