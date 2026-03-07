import { Controller, Logger } from '@nestjs/common';
import { ToolService } from './tool.service';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { createTool } from '@tooly-rent/contracts';

@Controller()
export class ToolController {
  constructor(private readonly toolyService: ToolService) {}
  private readonly logger = new Logger(ToolController.name);

  @RMQRoute(createTool.topic)
  @RMQValidate()
  async createTool(dto: createTool.Request, @RMQMessage msg: Message) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][Tool Service] Creating tool request`,
    );
    try {
      const result = await this.toolyService.createTool({
        title: dto.title,
        description: dto.description,
        pricePerDay: dto.pricePerDay,
        categoryIds: dto.categories,
        imageUrl: dto.images
      });
      this.logger.log(
        `[${requestId}][Tool Service] Tool created: ${result.id}`,
      );
      return {
        toolId: result.id,
        success: true
      };
    } catch (error) {
      this.logger.error(
        `[${requestId}][Tool Service] Tool creating failed`,
      );
      throw error;
    }
  }
}
