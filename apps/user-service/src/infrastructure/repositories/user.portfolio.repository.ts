import {
  IUserProfileRepository,
  UpdateUserData,
} from '../../domain/repositories/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user.profile.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserPortfolioRepository implements IUserProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userId: string): Promise<UserProfileEntity> {
    const user = await this.prismaService.userProfile.create({
      data: {
        userId,
      },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async getProfileById(userId: string): Promise<UserProfileEntity | null> {
    const user = await this.prismaService.userProfile.findUnique({
      where: { userId },
    });
    return user ? this.mapToEntity(user) : null;
  }
  async getAllUsers(): Promise<UserProfileEntity[]> {
    return this.prismaService.userProfile.findMany();
  }
  async deleteUserById(userId: string): Promise<UserProfileEntity> {
    const deletedUser = await this.prismaService.userProfile.delete({
      where: { userId },
    });
    return this.mapToEntity(deletedUser);
  }
  async updateProfileById(
    userId: string,
    data: UpdateUserData,
  ): Promise<UserProfileEntity> {
    const user = await this.prismaService.userProfile.update({
      where: { userId },
      data,
    });
    return this.mapToEntity(user);
  }

  private mapToEntity(prismaUser: any): UserProfileEntity {
    return new UserProfileEntity({
      id: prismaUser.id,
      userId: prismaUser.userId,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      avatar: prismaUser.avatar,
      phone: prismaUser.phone,
      address: prismaUser.address,
      isPhoneVerified: prismaUser.isPhoneVerified,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
