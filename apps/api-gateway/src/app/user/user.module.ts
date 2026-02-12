import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthGuard, RolesGuard],
  exports: [UserService],
})
export class UserModule {}
