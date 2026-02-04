import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class CookieManager {
  constructor(private readonly configService: ConfigService) {}

  setRefreshToken(response: Response, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
  }

  clearRefreshToken(response: Response): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/auth',
    });
  }

  getRefreshToken(request: Request): string | undefined {
    return request.cookies?.['refreshToken'];
  }
}
