import { Body, Controller, Post, Req } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { RegisterDto } from '../dtos/register.dto';
import { AccountRegister } from '@tooly-rent/contracts';
import { Request } from 'express';
import { LoggerService } from '@tooly-rent/common';

@Controller('auth')
export class AuthController {
  private readonly logger = new LoggerService('AuthController');

  constructor(private readonly rmqService: RMQService) {}

  @Post('register')
  public async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const requestId = req['requestId'];
    const timestamp = new Date().toISOString();
    this.logger.log(`Registration attempt for email: ${dto.email}`, requestId);
    try {
      const result = await this.rmqService.send<
        AccountRegister.Response,
        AccountRegister.Request
      >(AccountRegister.topic, dto, {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
          // userId: req?.user?.id || 'anonymous',
        },
      });
      this.logger.log(
        `Registration successful for user: ${result.email}`,
        requestId,
      );
    } catch (e) {
      this.logger.error(
        `Registration failed: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }
}
