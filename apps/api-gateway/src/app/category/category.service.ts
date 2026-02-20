import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import {
  deleteCategoryById,
  getAllCategory,
  getCategoryById,
  updateCategoryById,
} from '@tooly-rent/contracts';


@Injectable()
export class CategoryService {
  constructor(private readonly rmqService: RMQService) {}

  async getCategoryById(
    categoryId: getCategoryById.Request,
    requestId: string,
    timestamp: string,
  ): Promise<getCategoryById.Response> {
    return this.rmqService.send<
      getCategoryById.Request,
      getCategoryById.Response
    >(getCategoryById.topic, categoryId, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }

  async getAllCategories(
    requestId: string,
    timestamp: string,
  ): Promise<getAllCategory.Response> {
    return this.rmqService.send<object, getAllCategory.Response>(
      getAllCategory.topic,
      {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
        },
      },
    );
  }

  async deleteCategoryById(
    categoryId: deleteCategoryById.Request,
    requestId: string,
    timestamp: string,
  ): Promise<deleteCategoryById.Response> {
    return await this.rmqService.send<
      deleteCategoryById.Request,
      deleteCategoryById.Response
    >(deleteCategoryById.topic, categoryId, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }

  async updateCategoryById(
    dto: updateCategoryById.Request,
    requestId: string,
    timestamp: string,
  ): Promise<updateCategoryById.Response> {
    return await this.rmqService.send<
      updateCategoryById.Request,
      updateCategoryById.Response
    >(updateCategoryById.topic, dto, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }
}
