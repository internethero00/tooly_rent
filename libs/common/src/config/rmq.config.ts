import { IRMQServiceAsyncOptions } from 'nestjs-rmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Shared RabbitMQ configuration for every service.
 *
 * `serviceName` identifies the service in nestjs-rmq (and in logs / RPC replies).
 * `queueName` is read from `AMQP_QUEUE`: consumers set it, the api-gateway leaves
 * it unset (sender-only) — `ConfigService.get` returns `undefined` there, which
 * nestjs-rmq treats as "do not declare a consumer queue".
 */
export const getRMQConfig = (serviceName: string): IRMQServiceAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    exchangeName: configService.getOrThrow<string>('AMQP_EXCHANGE'),
    connections: [
      {
        login: configService.getOrThrow<string>('AMQP_LOGIN'),
        password: configService.getOrThrow<string>('AMQP_PASSWORD'),
        host: configService.getOrThrow<string>('AMQP_HOSTNAME'),
      },
    ],
    queueName: configService.get<string>('AMQP_QUEUE'),
    prefetchCount: 32,
    serviceName,
  }),
});
