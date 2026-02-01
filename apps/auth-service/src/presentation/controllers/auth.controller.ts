import { Controller } from '@nestjs/common';
import { AuthService } from '../../app/auth/auth.service';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AccountRegister } from '@tooly-rent/contracts';
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
}
