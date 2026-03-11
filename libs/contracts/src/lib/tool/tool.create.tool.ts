import {
  IsString,
  IsNumber,
  IsArray,
} from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createTool {
  export const topic = 'tool.create.command';

  export class CategoryInput {
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
    images?: string[];

    @IsArray()
    @IsString({ each: true })
    categories?: string[];
  }
  export class Response {
    toolId?: string;
    success?: boolean;
  }
}

