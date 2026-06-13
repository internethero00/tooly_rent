import { Module } from '@nestjs/common';
import { UsersModule } from '../presentation/users.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from '@tooly-rent/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'envs', '.user-service.env'),
    }),
    PrismaModule,
    RMQModule.forRootAsync(getRMQConfig('tooly_rent-user')),
    UsersModule,
  ],
})
export class AppModule {}
