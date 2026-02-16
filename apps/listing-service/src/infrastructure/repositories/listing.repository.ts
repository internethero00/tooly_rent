import { ListingEntity } from 'src/domain/entities/listing.entity';
import {
  IListingRepository,
  ToolData,
} from '../../domain/repositories/listing.repository.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingRepository implements IListingRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async getToolById(id: string): Promise<ListingEntity | null> {
    const tool = await this.prismaService.tool.findUnique({
      where: { id },
    });
    return tool ? this.mapToEntity(tool) : null;
  }
  async getAllTools(): Promise<ListingEntity[]> {
    const tools = await this.prismaService.tool.findMany();
    return tools.map((tool) => this.mapToEntity(tool));
  }
  async deleteToolById(id: string): Promise<ListingEntity> {
    const deleted = await this.prismaService.tool.delete({
      where: { id },
      include: { images: true, categories: true },
    });
    return this.mapToEntity(deleted);
  }
  async updateToolById(id: string, data: ToolData): Promise<ListingEntity> {
    const updated = await this.prismaService.tool.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        pricePerDay: data.pricePerDay,
        categories: {
          set: data.categoryIds.map((id) => ({ id })),
        },
      },
      include: {
        images: true,
        categories: true,
      },
    });
    return this.mapToEntity(updated);
  }
  async createTool(data: ToolData): Promise<ListingEntity> {
    const newTool = await this.prismaService.tool.create({
      data: {
        title: data.title,
        description: data.description,
        pricePerDay: data.pricePerDay,
        categories: {
          connect: data.categoryIds.map((id) => ({
            id,
          })),
        },
      },
      include: {
        images: true,
        categories: true,
      },
    });

    return this.mapToEntity(newTool);
  }

  private mapToEntity(prismaListing: any): ListingEntity {
    return new ListingEntity({
      id: prismaListing.id,
      title: prismaListing.title,
      description: prismaListing.description,
      pricePerDay: prismaListing.pricePerDay,
      images: prismaListing.images,
      categories: prismaListing.categories,
      createdAt: prismaListing.createdAt,
      updatedAt: prismaListing.updatedAt,
    });
  }
}
