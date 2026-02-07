// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AccountDeleteUser {
  export const topic = 'account.delete-user.command';

  export class Request {
    userId?: string;
    initiatedBy?: string;
  }

  export class Response {
    sagaId?: string;
  }
}
