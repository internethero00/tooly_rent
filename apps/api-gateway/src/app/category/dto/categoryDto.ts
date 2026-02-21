import { IsString } from 'class-validator';

export class CategoryDto {
  @IsString({ message: 'name of category is required' })
  name: string;
}
