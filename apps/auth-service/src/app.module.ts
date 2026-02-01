import { Module } from '@nestjs/common';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './config/rmq.config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'envs/.auth-service.env',
    }),
    PrismaModule,
    RMQModule.forRootAsync(getRMQConfig()),
  ],
})
export class AppModule {}
