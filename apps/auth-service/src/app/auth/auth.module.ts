import { Module } from '@nestjs/common';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { DeletionSaga } from '../sagas/deletion.saga';
import { ScheduleModule } from '@nestjs/schedule';
import { DeletionTimeoutService } from '../sagas/deletion-timeout.service';

@Module({
  imports: [JwtModule.register({}), ScheduleModule.forRoot()],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService, DeletionSaga, DeletionTimeoutService],
})
export class AuthModule {}
