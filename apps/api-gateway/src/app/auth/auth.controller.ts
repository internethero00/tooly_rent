import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Request, Response } from 'express';
import { LoggerService } from '@tooly-rent/common';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { CookieManager } from './utils/cookie.manager';
import { AccountLogin, AccountRegister } from '@tooly-rent/contracts';
import { AuthenticatedRequest } from '../types/authenticatedRequest.type';
import { AccountRefreshToken } from '@tooly-rent/contracts';

@Controller('auth')
export class AuthController {
  private readonly logger = new LoggerService(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly cookieManager: CookieManager,
  ) {}

  @Post('register')
  public async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    this.logger.log(`Registration attempt for email: ${dto.email}`, requestId);
    let result: AccountRegister.Response;
    try {
      result = await this.authService.register(dto, requestId, timestamp);
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
    this.cookieManager.setRefreshToken(response, result.refresh_token);

    return {
      access_token: result.access_token,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestId = req['requestId'];
    const timestamp = new Date().toISOString();
    this.logger.log(`Login attempt for email: ${dto.email}`, requestId);
    let result: AccountLogin.Response;
    try {
      result = await this.authService.login(dto, requestId, timestamp);
      this.logger.log(`Login successful for user: ${result.id}`, requestId);
    } catch (e) {
      this.logger.error(`Login failed: ${e.message}`, e.stack, requestId);
      throw e;
    }
    this.cookieManager.setRefreshToken(response, result.refresh_token);

    return {
      access_token: result.access_token,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
    };
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    const requestId = req['requestId'];
    this.logger.log(`Logout attempt`, requestId);
    this.cookieManager.clearRefreshToken(response);

    return { message: 'Logged out successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestId = req['requestId'];
    const timestamp = new Date().toISOString();
    this.logger.log(`Refresh attempt`, requestId);
    const refreshToken = this.cookieManager.getRefreshToken(req);
    let result: AccountRefreshToken.Response
    try {
      result = await this.authService.refresh({refresh_token: refreshToken}, requestId, timestamp);
      this.logger.log(`Refresh successful for user`, requestId);
    }catch (e) {
      this.logger.error(`Refresh failed: ${e.message}`, e.stack, requestId);
      throw e;
    }
    this.cookieManager.setRefreshToken(response, result.refresh_token);

    return {
      access_token: result.access_token,
    };
  }
}
