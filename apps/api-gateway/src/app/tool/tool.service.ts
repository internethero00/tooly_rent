import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import {
  createTool,
} from '@tooly-rent/contracts';
import { CreateToolDto } from './dto/createToolDto';
import {StorageService} from "../s3/storage.service";
import {
  updateToolById,
  getToolById,
  getAllTools,
  deleteToolById,
} from '@tooly-rent/contracts';


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
    const imageUrls = await this.uploadFiles(files);

    return await this.rmqService.send<
      updateToolById.Request,
      updateToolById.Response
    >(
      updateToolById.topic,
      {
        toolId,
        title: dto.title,
        description: dto.description,
        pricePerDay: dto.pricePerDay,
        images: imageUrls,
        categoryIds: dto.categoryIds,
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
  async getToolById(
    toolId: getToolById.Request,
    requestId: string,
    timestamp: string,
  ): Promise<getToolById.Response> {
    return this.rmqService.send<getToolById.Request, getToolById.Response>(
      getToolById.topic,
      toolId,
      {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
        },
      },
    );
  }

  async getAllTools(
    dto: getAllTools.Request,
    requestId: string,
    timestamp: string,
  ): Promise<getAllTools.Response> {
    return this.rmqService.send<getAllTools.Request, getAllTools.Response>(
      getAllTools.topic,
      dto,
      {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
        },
      },
    );
  }

  async deleteToolById(
    toolId: deleteToolById.Request,
    requestId: string,
    timestamp: string,
  ): Promise<deleteToolById.Response> {
    return await this.rmqService.send<
      deleteToolById.Request,
      deleteToolById.Response
    >(deleteToolById.topic, toolId, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }
}
