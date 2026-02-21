// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createCategory {
  export const topic = 'category.create.command';
  export class Request {
    name?: string;
  }
  export class Response {
    id?: string;
    name?: string;
  }
}
