import { Module } from '@nestjs/common';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
