import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import {
  createTool,
} from '@tooly-rent/contracts';
import { CreateToolDto } from './dto/createToolDto';
import {StorageService} from "../s3/storage.service";
import { updateToolById } from '@tooly-rent/contracts';


@Injectable()
export class ToolService {
  constructor(
    private readonly rmqService: RMQService,
    private readonly storageService: StorageService,
  ) {}

  private async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map((file) =>
      this.storageService.uploadFile(file),
    );

    return Promise.all(uploadPromises);
  }

  async createTool(
    dto: CreateToolDto,
    files: Express.Multer.File[],
    requestId: string,
    timestamp: string,
  ): Promise<createTool.Response> {
    const imageUrls = await this.uploadFiles(files);

    return this.rmqService.send<createTool.Request, createTool.Response>(
      createTool.topic,
      {
        title: dto.title,
        description: dto.description,
        pricePerDay: dto.pricePerDay,
        images: imageUrls,
        categories: dto.categories,
      },
      {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
        },
      },
    );
  }
  async updateToolById(
    toolId: string,
    dto: updateToolById.Request,
    files: Express.Multer.File[],
    requestId: string,
    timestamp: string,
  ): Promise<updateToolById.Response> {
    return await this.rmqService.send<
      updateToolById.Request,
      updateToolById.Response
    >(updateToolById.topic, dto, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }
  // async getToolById(
  //   categoryId: getCategoryById.Request,
  //   requestId: string,
  //   timestamp: string,
  // ): Promise<getCategoryById.Response> {
  //   return this.rmqService.send<
  //     getCategoryById.Request,
  //     getCategoryById.Response
  //   >(getCategoryById.topic, categoryId, {
  //     headers: {
  //       requestId,
  //       timestamp,
  //       service: 'api-gateway',
  //     },
  //   });
  // }
  //
  // async getAllTools(
  //   requestId: string,
  //   timestamp: string,
  // ): Promise<getAllCategory.Response> {
  //   return this.rmqService.send<object, getAllCategory.Response>(
  //     getAllCategory.topic,
  //     {
  //       headers: {
  //         requestId,
  //         timestamp,
  //         service: 'api-gateway',
  //       },
  //     },
  //   );
  // }
  //
  // async deleteToolById(
  //   categoryId: deleteCategoryById.Request,
  //   requestId: string,
  //   timestamp: string,
  // ): Promise<deleteCategoryById.Response> {
  //   return await this.rmqService.send<
  //     deleteCategoryById.Request,
  //     deleteCategoryById.Response
  //   >(deleteCategoryById.topic, categoryId, {
  //     headers: {
  //       requestId,
  //       timestamp,
  //       service: 'api-gateway',
  //     },
  //   });
  // }
  //
}
