import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJWTConfig } from './configs/jwt.config';
import { AuthController } from './controllers/auth.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'envs/.api-gateway.env',
    }),
    RMQModule.forRootAsync(
      getRMQConfig()
    ),
    JwtModule.registerAsync(getJWTConfig()),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AppModule {}
