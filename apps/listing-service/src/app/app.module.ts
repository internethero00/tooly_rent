import { Module } from '@nestjs/common';
import { ToolModule } from '../presentation/tool/tool.module';
import { CategoryModule } from '../presentation/category/category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from '../config/rmq.config';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'envs', '.listing-service.env'),
    }),
    PrismaModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: configService.get('REDIS_PORT') || 6379,
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: 300,
        }),
      }),
    }),
    RMQModule.forRootAsync(getRMQConfig()),
    ToolModule,
    CategoryModule,
  ],
})
export class AppModule {}
