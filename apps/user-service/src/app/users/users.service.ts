import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  IUserProfileRepository,
  USER_PROFILE_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { RMQService } from 'nestjs-rmq';
import { AccountUserDeletionStarted,
  USER_PROFILE_DELETED, USER_PROFILE_DELETION_FAILED, UserProfileDeleted, UserProfileDeletionFailed } from '@tooly-rent/contracts';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly rmqService: RMQService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async deleteUserById({userId, sagaId} : AccountUserDeletionStarted.Event) {
    const user = await this.userProfileRepository.getProfileById(userId);

    if (!user) {
      await this.rmqService.notify<UserProfileDeletionFailed.Event>(USER_PROFILE_DELETION_FAILED, {userId, sagaId, error:'User not found'})
    }
    try {
      await this.userProfileRepository.deleteUserById(userId);
      await this.rmqService.notify<UserProfileDeleted.Event>(USER_PROFILE_DELETED, {userId, sagaId})
    }
    catch {
      await this.rmqService.notify<UserProfileDeletionFailed.Event>(USER_PROFILE_DELETION_FAILED, {userId, sagaId, error:'Something went wrong'})
    }
  }

}
