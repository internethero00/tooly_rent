import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateToolDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  pricePerDay?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  categoryIds?: string[];
}
