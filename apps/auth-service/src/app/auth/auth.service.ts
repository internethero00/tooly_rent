import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { JwtService } from '@nestjs/jwt';
import {
  AccountLogin,
  AccountRefreshToken,
  AccountRegister,
  createUser,
} from '@tooly-rent/contracts';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../domain/entities/user.entity';
import { RMQService } from 'nestjs-rmq';

export type PayloadType = {
  sub: string;
  email: string;
  role: string;
}
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rmqService: RMQService,
  ) {}
  async register(
    dto: AccountRegister.Request,
  ): Promise<AccountRegister.Response> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new Error('User with this email already exists');
    }
    const hashPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash: hashPassword,
      role: 'USER',
    });
    await this.rmqService.notify<createUser.Request>(createUser.topic, {
      userId: user.id,
    });
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }
  async login(dto: AccountLogin.Request): Promise<AccountLogin.Response> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isPendingDeletion) {
      throw new UnauthorizedException('Account is being deleted');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async verifyToken(token: string) {
      const payload: PayloadType = await this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(userId: string, email: string, role: string): AccountRefreshToken.Response {
    const payload = { sub: userId, email, role };
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn:
        this.configService.getOrThrow('JWT_ACCESS_EXPIRATION') || '15m',
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn:
        this.configService.getOrThrow('JWT_REFRESH_EXPIRATION') || '7d',
    });
    return { access_token, refresh_token };
  }

  async findById(userId: string): Promise<UserEntity> {
    return  await this.userRepository.findById(userId);
  }
}
