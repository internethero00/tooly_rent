import { Inject, Injectable } from '@nestjs/common';
import {
  IUserProfileRepository,
  USER_PROFILE_REPOSITORY,
} from '../domain/repositories/user.repository.interface';
import { RMQService } from 'nestjs-rmq';
import {
  AccountUserDeletionStarted,
  USER_PROFILE_DELETED,
  USER_PROFILE_DELETION_FAILED,
  UserProfileDeleted,
  UserProfileDeletionFailed,
  getUserById,
  AccountGetUserById,
  updateUserById,
} from '@tooly-rent/contracts';
import { UserProfileEntity } from '../domain/entities/user.profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly rmqService: RMQService,
  ) {}

  async updateUserById(
    {userId, ...data}: updateUserById.Request,
  ): Promise<UserProfileEntity> {
    return await this.userProfileRepository.updateProfileById(userId, data)
  }

  async createUser(userId: string): Promise<UserProfileEntity> {
    return await this.userProfileRepository.createUser(userId);
  }

  async deleteUserById({ userId, sagaId }: AccountUserDeletionStarted.Event) {
    const user = await this.userProfileRepository.getProfileById(userId);

    if (!user) {
      await this.rmqService.notify<UserProfileDeletionFailed.Event>(
        USER_PROFILE_DELETION_FAILED,
        { userId, sagaId, error: 'User not found' },
      );
    }
    try {
      await this.userProfileRepository.deleteUserById(userId);
      await this.rmqService.notify<UserProfileDeleted.Event>(
        USER_PROFILE_DELETED,
        { userId, sagaId },
      );
    } catch {
      await this.rmqService.notify<UserProfileDeletionFailed.Event>(
        USER_PROFILE_DELETION_FAILED,
        { userId, sagaId, error: 'Something went wrong' },
      );
    }
  }

  async getUserById({ userId }: getUserById.Request) {
    const userProfile = await this.userProfileRepository.getProfileById(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }
    const userAuthService = await this.rmqService.send<
      AccountGetUserById.Request,
      AccountGetUserById.Response
    >(AccountGetUserById.topic, { userId });
    return {
      ...userAuthService,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      avatar: userProfile.avatar,
    };
  }
}
