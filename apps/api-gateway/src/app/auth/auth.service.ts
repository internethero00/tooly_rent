import { RMQService } from 'nestjs-rmq';
import { Injectable } from '@nestjs/common';
import {
  AccountLogin,
  AccountRefreshToken,
  AccountRegister,
} from '@tooly-rent/contracts';

@Injectable()
export class AuthService {
  constructor(private readonly rmqService: RMQService) {}

  async register(
    dto: AccountRegister.Request, requestId: string, timestamp: string
  ): Promise<AccountRegister.Response> {
    return this.rmqService.send<
      AccountRegister.Request,
      AccountRegister.Response
    >(AccountRegister.topic, dto, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }

  async login(
    dto: AccountLogin.Request, requestId: string, timestamp: string
  ): Promise<AccountLogin.Response> {
    return this.rmqService.send<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, dto, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }

  async refresh(
    token: AccountRefreshToken.Request, requestId: string, timestamp: string
  ): Promise<AccountRefreshToken.Response> {
    return this.rmqService.send<
      AccountRefreshToken.Request,
      AccountRefreshToken.Response
    >(AccountRefreshToken.topic, token, {
      headers: {
        requestId,
        timestamp,
        service: 'api-gateway',
      },
    });
  }
}
