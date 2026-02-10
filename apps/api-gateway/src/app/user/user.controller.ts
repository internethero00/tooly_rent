import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { LoggerService } from '@tooly-rent/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.user.dto';
import { Authorization } from '../decorators/auth.decorator';
import { UserRole } from '../decorators/roles.decorator';
import { Request } from 'express';
import {
  AccountDeleteUser,
  getUserById,
  updateUserById,
} from '@tooly-rent/contracts';
import { AuthenticatedRequest } from '../types/authenticatedRequest.type';

@Controller('users')
export class UserController {
  private readonly logger = new LoggerService(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Authorization(UserRole.USER, UserRole.ADMIN)
  @Delete(':id')
  async deleteUserById(@Param('id') userId: string, @Req() req: Request) {
    const userInfo: AuthenticatedRequest = req['user'];
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Deleting user with id ${userId}`, requestId);
    if (userInfo.user.role === UserRole.USER && userInfo.user.sub !== userId) {
      throw new ForbiddenException('You can only access your own profile');
    }
    let result: AccountDeleteUser.Response;
    try {
      result = await this.userService.deleteUserById(
        { userId },
        requestId,
        timestamp,
      );
      this.logger.log(`Deleting user with id successful: ${userId}`, requestId);
      return result;
    }catch(e) {
      this.logger.error(
        `Deleting user with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Authorization(UserRole.USER, UserRole.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') userId: string, @Req() req: Request) {
    const userInfo: AuthenticatedRequest = req['user'];
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Getting user with id ${userId}`, requestId);
    if (userInfo.user.role === UserRole.USER && userInfo.user.sub !== userId) {
      throw new ForbiddenException('You can only access your own profile');
    }
    let result: getUserById.Response;
    try {
      result = await this.userService.getUserById(
        { userId },
        requestId,
        timestamp,
      );
      this.logger.log(
        `Getting user with id successful: ${result.id}`,
        requestId,
      );
      return result;
    } catch (e) {
      this.logger.error(
        `Getting user with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Authorization(UserRole.USER)
  @Put(':id')
  async updateUserById(
    @Param('id') userId: string,
    @Req() req: Request,
    @Body() dto: UpdateUserDto
  ){
    const userInfo: AuthenticatedRequest = req['user'];
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Updating user with id ${userId}`, requestId);
    if (userInfo.user.role === UserRole.USER && userInfo.user.sub !== userId) {
      throw new ForbiddenException('You can only access your own profile');
    }
    let result: updateUserById.Response;
    try {
      result = await this.userService.updateUserById(
        { userId, ...dto },
        requestId,
        timestamp,
      );
      this.logger.log(`Updating user with id successful`, requestId);
      return result;
    }
    catch(e) {
      this.logger.error(`Updating user with id: ${e.message}`, e.stack, requestId );
      throw e;
    }
  }
}
