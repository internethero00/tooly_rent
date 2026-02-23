import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createTool {
  export const topic = 'tool.create.command';

  class CategoryInput {
    @IsString()
    id?: string;

    @IsString()
    name?: string;
  }

  export class Request {
    @IsString()
    title?: string;

    @IsString()
    description?: string;

    @IsNumber()
    pricePerDay?: number;

    @IsArray()
    @IsString({ each: true })
    images?: string[]; // Массив URL или base64

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CategoryInput)
    categories?: CategoryInput[];
  }
  export class Response {
    toolId?: string;
    success?: boolean;
  }
}

