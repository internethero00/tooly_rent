import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), 'envs', '.user-service.env') });
console.log('AMQP_EXCHANGE=', process.env.AMQP_EXCHANGE);

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  Logger.log(`🚀 User Service is running`);
}
bootstrap();
