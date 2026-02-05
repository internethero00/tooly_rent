// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AccountRefreshToken {
  export const topic = 'account.refresh.command';
  export class Request {
    refresh_token!: string;
  }
  export class Response {
    access_token?: string;
    refresh_token?: string;
  }
}
