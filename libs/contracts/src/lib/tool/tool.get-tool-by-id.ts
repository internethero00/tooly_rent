import { Category, Image } from './tool.get-all-tools';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace getToolById {
  export const topic = 'tool.get-by-id.query';
  export class Request {
    toolId?: string;
  }
  export class Response {
    id?: string;
    title?: string;
    description?: string;
    pricePerDay?: number;
    images?: Image[];
    categories?: Category[];
    createdAt?: Date;
    updatedAt?: Date;
  }
}
