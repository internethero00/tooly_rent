import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateToolDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber()
  @Min(0, { message: 'Price must be positive' })
  @Type(() => Number)
  pricePerDay: number;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  categories: string[];
}
