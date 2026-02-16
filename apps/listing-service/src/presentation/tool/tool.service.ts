import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ListingRepository } from '../../infrastructure/repositories/listing.repository';
import {
  LISTING_REPOSITORY,
  ToolData,
} from '../../domain/repositories/listing.repository.interface';
import { ListingEntity } from '../../domain/entities/listing.entity';

@Injectable()
export class ToolService {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listingRepository: ListingRepository,
  ) {}
  async getToolById(id: string): Promise<ListingEntity | null> {
    const tool = await this.listingRepository.getToolById(id);
    if (!tool) throw new NotFoundException(`Tool with id ${id} not found`);
    return tool;
  }

  async deleteToolById(id: string): Promise<ListingEntity> {
    try {
      return await this.listingRepository.deleteToolById(id);
    } catch {
      throw new NotFoundException(`Tool with id ${id} not found`);
    }
  }

  async updateToolById(id: string, data: ToolData): Promise<ListingEntity> {
    try {
      return await this.listingRepository.updateToolById(id, data);
    } catch {
      throw new NotFoundException(`Tool with id ${id} not found`);
    }
  }

  async createTool(data: ToolData): Promise<ListingEntity> {
    return await this.listingRepository.createTool(data);
  }
}
