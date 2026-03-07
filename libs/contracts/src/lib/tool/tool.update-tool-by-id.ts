import { Category, Image } from './tool.get-all-tools';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export  namespace updateToolById {
  export const topic = 'tool.update-by-id.command';
  export class Request {
    @IsString()
    @IsNotEmpty()
    toolId?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    pricePerDay?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoryIds?: string[];
  }
  export class Response {
    success?: boolean;
    updatedTool?: {
      id?: string;
      title?: string;
      description?: string;
      pricePerDay?: number;
      images?: Image[];
      categories?: Category[];
      createdAt?: Date;
      updatedAt?: Date;
    };
  }
}
