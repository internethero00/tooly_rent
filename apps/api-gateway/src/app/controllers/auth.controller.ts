import { Body, Controller, Post, Req } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { RegisterDto } from '../dtos/register.dto';
import { AccountLogin, AccountRegister } from '@tooly-rent/contracts';
import { Request } from 'express';
import { LoggerService } from '@tooly-rent/common';
import { LoginDto } from '../dtos/login.dto';

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
        AccountRegister.Request,
        AccountRegister.Response
      >(AccountRegister.topic, dto, {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
          // userId: req?.user?.id || 'anonymous',
        },
      });
      this.logger.log(
        `Registration successful for user: ${result.id}`,
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

  @Post('login')
  public async login(@Body() dto: LoginDto, @Req() req: Request) {
    const requestId = req['requestId'];
    const timestamp = new Date().toISOString();
    this.logger.log(`Login attempt for email: ${dto.email}`, requestId);
    try {
      const result = await this.rmqService.send<
        AccountLogin.Request,
        AccountLogin.Response
      >(AccountLogin.topic, dto, {
        headers: {
          requestId,
          timestamp,
          service: 'api-gateway',
          // userId: req?.user?.id || 'anonymous',
        },
      });
      this.logger.log(
        `Login successful for user: ${result.id}`,
        requestId,
      );
    } catch (e) {
      this.logger.error(
        `Login failed: ${e.message}`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }
}
