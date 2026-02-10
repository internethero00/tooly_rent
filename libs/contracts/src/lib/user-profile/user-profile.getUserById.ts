// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace getUserById {
  export const topic = 'user-profile.get-by-user-id.query';

  export class Request {
    userId?: string;
  }

  export class Response {
    id?: string;
    email?: string;
    role?: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    isActive?: boolean;
  }
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
