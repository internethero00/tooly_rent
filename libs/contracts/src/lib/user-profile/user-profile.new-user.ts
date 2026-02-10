
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createUser {
  export const topic = 'user-profile.create-user.command';

  export class Request {
    userId?: string;
  }
}
