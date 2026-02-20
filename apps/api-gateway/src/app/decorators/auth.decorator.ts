import { Roles, UserRole } from './roles.decorator';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { SelfOrAdminGuard } from '../guards/selfOrAdmin.guard';

export function Authorization(...roles: UserRole[]) {
  if (roles.length > 0) {
    return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
  }
  return applyDecorators(UseGuards(AuthGuard));
}

export function AuthorizeSelfOrAdmin() {
  return applyDecorators(
    Roles(UserRole.USER, UserRole.ADMIN),
    UseGuards(AuthGuard, RolesGuard, SelfOrAdminGuard),
  );
}
