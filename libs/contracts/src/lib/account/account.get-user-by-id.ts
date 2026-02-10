// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AccountGetUserById {
  export const topic = 'account.user.get-by-id.query';

  export class Request {
    userId?: string;
  }

  export class Response {
    id?: string;
    email?: string;
    role?: UserRole;
  }
}
export enum UserRole {
  USER = 'USER',
  ADMIN= 'ADMIN',
}
