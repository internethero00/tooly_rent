import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ToolSortField {
  CREATED_AT = 'createdAt',
  PRICE = 'pricePerDay',
  TITLE = 'title',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace getAllTools {
  export const topic = 'tool.get-all.query';

  export class Request {
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    skip?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    take?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoryIds?: string[];

    @IsOptional()
    @IsEnum(ToolSortField)
    sortBy?: ToolSortField;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;
  }

  export class Response {
    data?: ITool[];
    total?: number;
    skip?: number;
    take?: number;
    hasMore?: boolean;
  }
}

export interface ITool {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  images: Image[];
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
}
