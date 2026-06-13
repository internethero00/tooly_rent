import { Module } from '@nestjs/common';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from '@tooly-rent/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './config/jwt.config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'envs', '.auth-service.env'),
    }),
    PrismaModule,
    JwtModule.registerAsync(getJWTConfig()),
    RMQModule.forRootAsync(getRMQConfig('tooly_rent-auth')),
  ],
})
export class AppModule {}
