// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace updateUserById {
  export const topic = 'user-profile.update-by-user-id.command';

  export class Request {
    userId?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    phone?: string | null;
    address?: string | null;
  }

  export class Response {
    userId?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    phone?: string | null;
    address?: string | null;
  }
}

