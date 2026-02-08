import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJWTConfig } from './configs/jwt.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';


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
    AuthModule,
    UserModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
