import { IsNotEmpty, IsString } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace deleteToolById {
  export const topic = 'tool.delete-by-id.command';
  export class Request {
    @IsString()
    @IsNotEmpty()
    toolId?: string;
  }
  export class Response {
    success?: boolean;
    deletedId?: string;
  }
}
