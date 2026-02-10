import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { AccountDeleteUser, getUserById } from '@tooly-rent/contracts';


@Injectable()
export class UserService {
  constructor(private readonly rmqService: RMQService) {}

  async getUserById(
    userId: getUserById.Request,
    requestId: string,
    timestamp: string,
  ): Promise<getUserById.Response> {
    return this.rmqService.send<getUserById.Request, getUserById.Response>(
      getUserById.topic,
      userId,
      {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
        },
      },
    );
  }

  async deleteUserById(
    userId: AccountDeleteUser.Request,
    requestId: string,
    timestamp: string,
  ): Promise<AccountDeleteUser.Response> {
    return await this.rmqService.send<AccountDeleteUser.Request, AccountDeleteUser.Response>(
      AccountDeleteUser.topic,
      userId,
      {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
        },
      },
    );
  }
}
