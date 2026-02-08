import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './app/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './config/rmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'envs', '.user-service.env'),
    }),
    PrismaModule,
    UsersModule,
    RMQModule.forRootAsync(getRMQConfig()),
  ],
})
export class AppModule {}
