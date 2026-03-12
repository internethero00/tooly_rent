import { ListingEntity } from '../entities/listing.entity';


export const LISTING_REPOSITORY = Symbol('LISTING_REPOSITORY');

export interface IListingRepository {
  getToolById(id: string): Promise<ListingEntity | null>;
  deleteToolById(id: string): Promise<string>;
  updateToolById(id: string, data: ToolData): Promise<ListingEntity>;
  createTool(data: ToolData): Promise<ListingEntity>;
}

export interface ToolData {
  title?: string;
  description?: string;
  pricePerDay?: number;
  categoryIds?: string[];
  imageUrl?: string[];
}
