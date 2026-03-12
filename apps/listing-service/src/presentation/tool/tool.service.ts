import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ListingRepository } from '../../infrastructure/repositories/listing.repository';
import {
  LISTING_REPOSITORY,
  ToolData,
} from '../../domain/repositories/listing.repository.interface';
import { ListingEntity } from '../../domain/entities/listing.entity';
import {
  SortOrder,
  ToolSortField,
  getAllTools,
} from '@tooly-rent/contracts';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ToolService {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listingRepository: ListingRepository,
    private readonly prismaService: PrismaService,
  ) {}
  async getToolById(id: string): Promise<ListingEntity | null> {
    const tool = await this.listingRepository.getToolById(id);
    if (!tool) throw new NotFoundException(`Tool with id ${id} not found`);
    return tool;
  }

  async deleteToolById(id: string): Promise<string> {
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

  async getAllTools(dto: getAllTools.Request): Promise<getAllTools.Response> {
    const {
      skip = 0,
      take = 20,
      search,
      categoryIds,
      sortBy = ToolSortField.CREATED_AT,
      sortOrder = SortOrder.DESC,
      minPrice,
      maxPrice,
    } = dto;

    const whereConditions: Prisma.ToolWhereInput[] = [];

    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (categoryIds && categoryIds.length > 0) {
      whereConditions.push({
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.push({
        pricePerDay: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      });
    }

    const where: Prisma.ToolWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const orderBy: Prisma.ToolOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [tools, total] = await Promise.all([
      this.prismaService.tool.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      this.prismaService.tool.count({ where }),
    ]);

    const data: getAllTools.ITool[] = tools.map((tool) => ({
      id: tool.id,
      title: tool.title,
      description: tool.description,
      pricePerDay: tool.pricePerDay.toNumber(),
      images: tool.images.map((img) => ({
        id: img.id,
        url: img.url,
      })),
      categories: tool.categories.map((tc) => ({
        id: tc.category.id,
        name: tc.category.name,
      })),
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt,
    }));

    return {
      data,
      total,
      skip,
      take,
      hasMore: skip + take < total,
    };
  }
}
