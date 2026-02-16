import { UserProfileEntity } from '../entities/user.profile.entity';

export const USER_PROFILE_REPOSITORY = Symbol('USER_PROFILE_REPOSITORY')

export interface IUserProfileRepository {
  getProfileById(userId: string): Promise<UserProfileEntity | null>;
  getAllUsers(): Promise<UserProfileEntity[]>;
  deleteUserById(userId: string): Promise<UserProfileEntity>;
  updateProfileById(
    userId: string,
    data: UpdateUserData,
  ): Promise<UserProfileEntity>;
  createUser(userId: string): Promise<UserProfileEntity>;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

