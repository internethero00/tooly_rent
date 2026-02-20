import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString({ message: 'name of category is required' })
  name: string;
}
