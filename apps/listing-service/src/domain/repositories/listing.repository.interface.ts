import { ListingEntity } from '../entities/listing.entity';

export const LISTING_REPOSITORY = Symbol('LISTING_REPOSITORY');

export interface IListingRepository {
  getToolById(id: string): Promise<ListingEntity | null>;
  getAllTools(): Promise<ListingEntity[]>;
  deleteToolById(id: string): Promise<ListingEntity>;
  updateToolById(id: string, data: ToolData): Promise<ListingEntity>;
  createTool(data: ToolData): Promise<ListingEntity>;
}

export interface ToolData {
  title?: string;
  description?: string;
  pricePerDay?: number;
  categoryIds?: string[];
}
