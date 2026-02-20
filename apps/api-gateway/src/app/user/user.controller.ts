import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { LoggerService } from '@tooly-rent/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.user.dto';
import {
  Authorization,
  AuthorizeSelfOrAdmin,
} from '../decorators/auth.decorator';
import { UserRole } from '../decorators/roles.decorator';
import { Request } from 'express';
import {
  AccountDeleteUser,
  getUserById,
  updateUserById,
} from '@tooly-rent/contracts';


@Controller('users')
export class UserController {
  private readonly logger = new LoggerService(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Authorization(UserRole.USER, UserRole.ADMIN)
  @AuthorizeSelfOrAdmin()
  @Delete(':id')
  async deleteUserById(@Param('id') userId: string, @Req() req: Request) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Deleting user with id ${userId}`, requestId);
    let result: AccountDeleteUser.Response;
    try {
      result = await this.userService.deleteUserById(
        { userId },
        requestId,
        timestamp,
      );
      this.logger.log(`Deleting user with id successful: ${userId}`, requestId);
      return result;
    } catch (e) {
      this.logger.error(
        `Deleting user with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Authorization(UserRole.USER, UserRole.ADMIN)
  @AuthorizeSelfOrAdmin()
  @Get(':id')
  async getUserById(@Param('id') userId: string, @Req() req: Request) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Getting user with id ${userId}`, requestId);
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
  @AuthorizeSelfOrAdmin()
  @Put(':id')
  async updateUserById(
    @Param('id') userId: string,
    @Req() req: Request,
    @Body() dto: UpdateUserDto,
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Updating user with id ${userId}`, requestId);
    let result: updateUserById.Response;
    try {
      result = await this.userService.updateUserById(
        { userId, ...dto },
        requestId,
        timestamp,
      );
      this.logger.log(`Updating user with id successful`, requestId);
      return result;
    } catch (e) {
      this.logger.error(
        `Updating user with id: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }
}
