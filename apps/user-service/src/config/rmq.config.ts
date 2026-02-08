import { IRMQServiceAsyncOptions } from 'nestjs-rmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    exchangeName: configService.getOrThrow<string>('AMQP_EXCHANGE'),
    connections: [
      {
        login: configService.getOrThrow<string>('AMQP_LOGIN'),
        password: configService.getOrThrow<string>('AMQP_PASSWORD'),
        host: configService.getOrThrow<string>('AMQP_HOSTNAME'),
      }
    ],
    queueName: configService.get<string>('AMQP_QUEUE'),
    prefetchCount: 32,
    serviceName: 'tooly_rent-user',
  })
});
