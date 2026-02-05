import { Controller } from '@nestjs/common';
import { AuthService } from '../../app/auth/auth.service';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AccountLogin, AccountRefreshToken, AccountRegister } from '@tooly-rent/contracts';
import { LoggerService } from '@tooly-rent/common';

@Controller()
export class AuthController {
  private readonly logger = new LoggerService('AuthController');
  constructor(private readonly authService: AuthService) {}

  @RMQRoute(AccountRegister.topic)
  @RMQValidate()
  async register(
    dto: AccountRegister.Request,
    @RMQMessage msg: Message,
  ): Promise<AccountRegister.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Registration request for: ${dto.email}`);

    try {
      const result = await this.authService.register(dto);

      this.logger.log(`[${requestId}][Auth Service] User created: ${result.id}`);
      return result;
    }
    catch (error) {
      this.logger.error(`[${requestId}][Auth Service] Registration failed for: ${dto.email}`);
      throw error;
    }
  }

  @RMQRoute(AccountLogin.topic)
  @RMQValidate()
  async login(dto: AccountLogin.Request, @RMQMessage msg: Message): Promise<AccountLogin.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Login request for: ${dto.email}`);

    try {
      const result = await this.authService.login(dto);
      this.logger.log(`[${requestId}][Auth Service] Login successful: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[${requestId}][Auth Service] Login failed:`, error.message);
      throw error;
    }
  }

  @RMQRoute(AccountRefreshToken.topic)
  @RMQValidate()
  async refresh(dto: AccountRefreshToken.Request, @RMQMessage msg: Message):

    Promise<AccountRefreshToken.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Refresh request for: ${requestId}`);
    try {
      const tokens = await this.authService.verifyToken(dto.refresh_token);
      this.logger.log(`[${requestId}][Auth Service] Refresh successful`);
      return tokens
    }
    catch (e) {
      this.logger.error(`[${requestId}][Auth Service] Refresh failed:`, e.message);
      throw e;
    }
  }
}
