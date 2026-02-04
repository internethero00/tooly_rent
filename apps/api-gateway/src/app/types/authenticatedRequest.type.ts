import { UserRole } from '../decorators/roles.decorator';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
}


export type AuthenticatedRequest = Request & { user: AuthUser };
