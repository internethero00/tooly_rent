import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { LoggerService } from '@tooly-rent/common';
import { CategoryService } from './category.service';
import {
  Authorization,
  AuthorizeSelfOrAdmin,
} from '../decorators/auth.decorator';
import { UserRole } from '../decorators/roles.decorator';
import { Request } from 'express';
import {
  createCategory,
  deleteCategoryById,
  getCategoryById,
  updateCategoryById,
} from '@tooly-rent/contracts';
import { CategoryDto } from './dto/categoryDto';

@Controller('categories')
export class CategoryController {
  private readonly logger = new LoggerService(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  async getAllCategories(@Req() req: Request) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Getting all categories`, requestId);
    try {
      const results = await this.categoryService.getAllCategories(
        requestId,
        timestamp,
      );
      this.logger.log(`Getting categories successful: `, requestId);
      return results;
    } catch (e) {
      this.logger.error(`Getting categories: ${e.message}`, e.stack, requestId);
      throw e;
    }
  }

  @Authorization(UserRole.ADMIN)
  @AuthorizeSelfOrAdmin()
  @Delete(':id')
  async deleteCategoryById(
    @Param('id') categoryId: string,
    @Req() req: Request,
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Deleting category with id ${categoryId}`, requestId);
    let result: deleteCategoryById.Response;
    try {
      result = await this.categoryService.deleteCategoryById(
        { categoryId },
        requestId,
        timestamp,
      );
      this.logger.log(
        `Deleting category with id successful: ${categoryId}`,
        requestId,
      );
      return result;
    } catch (e) {
      this.logger.error(
        `Deleting category with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') categoryId: string, @Req() req: Request) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Getting category with id ${categoryId}`, requestId);
    let result: getCategoryById.Response;
    try {
      result = await this.categoryService.getCategoryById(
        { categoryId },
        requestId,
        timestamp,
      );
      this.logger.log(
        `Getting category with id successful: ${result.id}`,
        requestId,
      );
      return result;
    } catch (e) {
      this.logger.error(
        `Getting category with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Authorization(UserRole.ADMIN)
  @AuthorizeSelfOrAdmin()
  @Put(':id')
  async updateCategoryById(
    @Param('id') categoryId: string,
    @Req() req: Request,
    @Body() dto: CategoryDto,
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Updating category with id ${categoryId}`, requestId);
    let result: updateCategoryById.Response;
    try {
      result = await this.categoryService.updateCategoryById(
        { categoryId, name: dto.name },
        requestId,
        timestamp,
      );
      this.logger.log(`Updating category with id successful`, requestId);
      return result;
    } catch (e) {
      this.logger.error(
        `Updating category with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Authorization(UserRole.ADMIN)
  @AuthorizeSelfOrAdmin()
  @Post()
  async createCategory(
    @Req() req: Request,
    @Body() dto: CategoryDto,
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Creating category`, requestId);
    let result: createCategory.Response;
    try {
      result = await this.categoryService.createCategory(
        dto,
        requestId,
        timestamp,
      );
      this.logger.log(`Updating category with id successful`, requestId);
      return result;
    } catch (e) {
      this.logger.error(
        `Updating category with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }
}
