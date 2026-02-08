import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'firstname is string' })
  @IsOptional()
  firstName: string;

  @IsString({ message: 'lastname is string' })
  @IsOptional()
  lastName: string;

  @IsString({ message: 'avatar is required' })
  @IsOptional()
  avatar: string;

  @IsString({ message: 'phone is required' })
  @IsOptional()
  phone: string;

  @IsString({ message: 'address is required' })
  @IsOptional()
  address: string;
}


