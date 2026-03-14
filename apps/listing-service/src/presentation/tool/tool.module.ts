import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { LISTING_REPOSITORY } from '../../domain/repositories/listing.repository.interface';
import { ListingRepository } from '../../infrastructure/repositories/listing.repository';

@Module({
  controllers: [ToolController],
  providers: [
    ToolService,
    {
      provide: LISTING_REPOSITORY,
      useClass: ListingRepository,
    },
  ],
  exports: [ToolService],
})
export class ToolModule {}
