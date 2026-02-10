import { Controller } from '@nestjs/common';
import { UsersService } from '../../app/users/users.service';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';
import {
  ACCOUNT_DELETION_STARTED,
  AccountUserDeletionStarted,
  getUserById,
} from '@tooly-rent/contracts';
import { LoggerService } from '@tooly-rent/common';

@Controller()
export class UsersController {
  private readonly logger = new LoggerService(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

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
  @RMQValidate()
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
}
