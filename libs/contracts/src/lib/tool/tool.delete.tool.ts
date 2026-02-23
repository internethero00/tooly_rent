// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace deleteCategoryById {
  export const topic = 'category.delete-by-id.command';
  export class Request {
    categoryId?: string;
  }
  export class Response {
    id?: string;
    name?: string;
  }
}
