import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthUser } from '../types/authenticatedRequest.type';
import { UserRole } from '@tooly-rent/contracts';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user: AuthUser = request['user'];
    const userId = context.switchToHttp().getRequest().params.id;

    if (user.role === UserRole.ADMIN) return true;
    if (user.sub === userId) return true;

    throw new ForbiddenException('You can only access your own profile');
  }
}
