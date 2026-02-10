import { UserRole } from '../decorators/roles.decorator';

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
};


export type AuthenticatedRequest = Request & { user: AuthUser };
