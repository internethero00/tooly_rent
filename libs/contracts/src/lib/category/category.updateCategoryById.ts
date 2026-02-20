// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace updateCategoryById {
  export const topic = 'category.update-by-id.command';
  export class Request {
    categoryId?: string;
    name?: string;
  }
  export class Response {
    id?: string;
    name?: string;
  }
}
