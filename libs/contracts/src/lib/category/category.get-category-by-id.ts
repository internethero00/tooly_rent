// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace getCategoryById {
  export const topic = 'category.get-by-id.query';
  export class Request {
    categoryId?: string;
  }
  export class Response {
    id?: string;
    name?: string;
  }
}
