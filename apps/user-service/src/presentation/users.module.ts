import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { USER_PROFILE_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { UserPortfolioRepository } from '../infrastructure/repositories/user.portfolio.repository';

@Module({
  providers: [
    UsersService,
    {
      provide: USER_PROFILE_REPOSITORY,
      useClass: UserPortfolioRepository,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
