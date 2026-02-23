import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerService } from '@tooly-rent/common';
import { ToolService } from './tool.service';
import {
  Authorization,
  AuthorizeSelfOrAdmin,
} from '../decorators/auth.decorator';
import { UserRole } from '../decorators/roles.decorator';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateToolDto } from './dto/createToolDto';


@Controller('tools')
class ToolController {
  private readonly logger = new LoggerService(ToolController.name);

  constructor(private readonly toolService: ToolService) {}

  @Authorization(UserRole.ADMIN)
  @AuthorizeSelfOrAdmin()
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async createTool(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Req() req: Request,
    @Body() dto: CreateToolDto,
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Creating tool`, requestId);
    try {
      const result = await this.toolService.createTool(
        dto,
        files,
        requestId,
        timestamp,
      );
      this.logger.log(`Creating tool with id successful`, requestId);
      return result;
    } catch (e) {
      this.logger.error(
        `Creating tool with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }
}

export default ToolController
