import {
  CreateUserData,
  IUserRepository,
  UpdateUserData,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.USER,
      },
    });
    return this.mapToEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })
    return !!user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })
    return user ? this.mapToEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    })
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
    return this.mapToEntity(user);
  }

  private mapToEntity(prismaUser: any): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      role: prismaUser.role,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
