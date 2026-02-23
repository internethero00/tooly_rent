import { Module } from '@nestjs/common';
import ToolController from './tool.controller';
import { ToolService } from './tool.service';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';
import { StorageService } from '../s3/storage.service';

@Module({
  imports: [],
  controllers: [ToolController],
  providers: [ToolService, AuthGuard, RolesGuard, StorageService],
  exports: [ToolService],
})
export class ToolModule {}
