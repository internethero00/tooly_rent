// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace getAllCategory {
  export const topic = 'category.get-all.query';

  export class Response {
    data?: ICategory[];
  }
}
export interface ICategory {
  id?: string;
  name?: string;
}
