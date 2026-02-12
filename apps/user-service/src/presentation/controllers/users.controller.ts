import { Controller } from '@nestjs/common';
import { UsersService } from '../../app/users/users.service';
import { Message, RMQMessage, RMQRoute } from 'nestjs-rmq';
import {
  ACCOUNT_DELETION_STARTED,
  AccountUserDeletionStarted,
  createUser,
  getUserById,
  updateUserById,
} from '@tooly-rent/contracts';
import { LoggerService } from '@tooly-rent/common';

@Controller()
export class UsersController {
  private readonly logger = new LoggerService(UsersController.name);

  constructor(private readonly usersService: UsersService) {
    console.log('🚀 UsersController initialized');
  }

  @RMQRoute(createUser.topic)
  async createUser(
    dto: createUser.Request,
    @RMQMessage msg: Message,
  ): Promise<createUser.Response> {
    console.log('📥 [User Service] Received message:', dto);
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][User Service] creating user by id: ${dto.userId}`,
    );

    try {
      const user = await this.usersService.createUser(dto.userId);
      console.log('✅ [User Service] User created:', user);
      if (!user) {
        return {created: false};
      }
      return {created: true};
    } catch (e) {
      console.error('❌ [User Service] Error:', e);
      this.logger.error(
        `[${requestId}][User Service] creating user failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(ACCOUNT_DELETION_STARTED)
  async deleteUserById(
    event: AccountUserDeletionStarted.Event,
    @RMQMessage msg: Message,
  ) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][User Service] deleting user by id: ${event.userId}`,
    );
    try {
      await this.usersService.deleteUserById(event);
    } catch (e) {
      this.logger.error(
        `[${requestId}][User Service] deleting failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(getUserById.topic)
  async getUserById(
    dto: getUserById.Request,
    @RMQMessage msg: Message,
  ): Promise<getUserById.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][User Service] getting user by id: ${dto.userId}`,
    );
    try {
      return await this.usersService.getUserById(dto);
    } catch (e) {
      this.logger.error(
        `[${requestId}][User Service] getting user failed:`,
        e.message,
      );
      throw e;
    }
  }

  @RMQRoute(updateUserById.topic)
  async updateUserById(
    dto: updateUserById.Request,
    @RMQMessage msg: Message,
  ): Promise<updateUserById.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(
      `[${requestId}][User Service] updating user by id: ${dto.userId}`,
    );
    try {
      return await this.usersService.updateUserById(dto);
    } catch (e) {
      this.logger.error(
        `[${requestId}][User Service] updating user failed:`,
        e.message,
      );
      throw e;
    }
  }
}
