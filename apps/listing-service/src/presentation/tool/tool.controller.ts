import { Controller, Logger } from '@nestjs/common';
import { ToolService } from './tool.service';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';
import {
  createTool,
  getAllTools,
  getToolById,
  updateToolById,
  deleteToolById
} from '@tooly-rent/contracts';

@Controller()
export class ToolController {
  constructor(private readonly toolyService: ToolService) {}
  private readonly logger = new Logger(ToolController.name);

  @RMQRoute(createTool.topic)
  @RMQValidate()
  async createTool(dto: createTool.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Tool Service] Creating tool request`);
    try {
      const result = await this.toolyService.createTool({
        title: dto.title,
        description: dto.description,
        pricePerDay: dto.pricePerDay,
        categoryIds: dto.categories,
        imageUrl: dto.images,
      });
      this.logger.log(
        `[${requestId}][Tool Service] Tool created: ${result.id}`,
      );
      return {
        toolId: result.id,
        success: true,
      };
    } catch (error) {
      this.logger.error(`[${requestId}][Tool Service] Tool creating failed`);
      throw error;
    }
  }

  @RMQRoute(updateToolById.topic)
  @RMQValidate()
  async updateTool(dto: updateToolById.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Tool Service] Updating tool request`);
    try {
      const result = await this.toolyService.updateToolById(dto.toolId, {
        title: dto.title,
        description: dto.description,
        pricePerDay: dto.pricePerDay,
        categoryIds: dto.categoryIds,
        imageUrl: dto.images,
      });
      this.logger.log(
        `[${requestId}][Tool Service] Tool updated: ${result.id}`,
      );
      return {
        success: true,
        updatedTool: result,
      };
    } catch (error) {
      this.logger.error(`[${requestId}][Tool Service] Tool updating failed`);
      throw error;
    }
  }

  @RMQRoute(getToolById.topic)
  async getToolById({ toolId }: getToolById.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Tool Service] Getting tool request`);
    try {
      const result = await this.toolyService.getToolById(toolId);
      this.logger.log(
        `[${requestId}][Tool Service] Tool getting: ${result.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[${requestId}][Tool Service] Tool getting id ${toolId} failed`,
      );
      throw error;
    }
  }

  @RMQRoute(getAllTools.topic)
  async getAllTools(dto: getAllTools.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Tool Service] Getting all tools request`);
    try {
      const result = await this.toolyService.getAllTools(dto);
      this.logger.log(
        `[${requestId}][Tool Service] Getting all tools`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[${requestId}][Tool Service] Getting all tools failed`,
      );
      throw error;
    }
  }

  @RMQRoute(deleteToolById.topic)
  @RMQValidate()
  async deleteToolById(dto: deleteToolById.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Tool Service] Deleting tool id=${dto.toolId} request`);
    try {
      const deletedId = await this.toolyService.deleteToolById(dto.toolId);
      this.logger.log(
        `[${requestId}][Tool Service] Deleting tool id=${dto.toolId}`,
      );
      return {
        success: true,
        deletedId,
      };
    } catch {
      this.logger.error(
        `[${requestId}][Tool Service] Deleting tool id=${dto.toolId} failed`,
      );
      return {
        success: false
      }
    }
  }
}
