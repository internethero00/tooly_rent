import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
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
import { UpdateToolDto } from './dto/updateToolDto';


@Controller('tools')
class ToolController {
  private readonly logger = new LoggerService(ToolController.name);

  constructor(private readonly toolService: ToolService) {}

  @Put(':id')
  @Authorization(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  async updateToolById(
    @Param('id') toolId: string,
    @Req() req: Request,
    @Body() dto: UpdateToolDto,
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
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Updating tool`, requestId);
    try {
      const result = await this.toolService.updateToolById(
        toolId,
        dto,
        files,
        requestId,
        timestamp,
      );
      this.logger.log(`Updating tool with id successful`, requestId);
      return result;
    } catch (e) {
      this.logger.error(
        `Updating tool with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Get(':id')
  async getToolById(@Param('id') toolId: string, @Req() req: Request) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Getting tool by ${toolId}`, requestId);
    try {
      const result = await this.toolService.getToolById(
        { toolId },
        requestId,
        timestamp,
      );
      this.logger.log(`Getting tool with id = ${toolId} successful`, requestId);
      return result;
    }
    catch (e) {
      this.logger.error(
        `Getting tool with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

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
