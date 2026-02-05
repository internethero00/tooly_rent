import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieManager } from './utils/cookie.manager';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CookieManager],
  exports: [AuthService]
})
export class AuthModule {}
