// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AccountDeleteUser {
  export const topic = 'account.delete-user.command';

  export class Request {
    userId?: string;
  }

  export class Response {
    sagaId?: string;
    status?: 'pending';
  }
}
