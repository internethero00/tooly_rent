import { RMQService } from 'nestjs-rmq';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AccountLogin,
  AccountRefreshToken,
  AccountRegister,
} from '@tooly-rent/contracts';

@Injectable()
export class AuthService {
  constructor(private readonly rmqService: RMQService) {}

  async register(
    dto: AccountRegister.Request,
    requestId: string,
    timestamp: string,
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

  async login(dto: AccountLogin.Request, requestId: string, timestamp: string) {
    try {
      return await this.rmqService.send(AccountLogin.topic, dto, {
        headers: { requestId, timestamp, service: 'api-gateway' },
      });
    } catch (err) {
      const msg = err?.message ?? 'Auth service error';

      if (msg === 'Invalid credentials' || msg === 'Account is being deleted') {
        throw new UnauthorizedException(msg);
      }

      throw new InternalServerErrorException('Auth service error');
    }

  }

  async refresh(
    token: AccountRefreshToken.Request,
    requestId: string,
    timestamp: string,
  ): Promise<AccountRefreshToken.Response> {
    return await this.rmqService.send<
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
