import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

dotenv.config({ path: resolve(process.cwd(), 'envs', '.listing-service.env') });

import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init()
  Logger.log(
    `🚀 Listing service is running`,
  );
}

bootstrap();
