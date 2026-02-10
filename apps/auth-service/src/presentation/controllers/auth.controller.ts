import { Controller } from '@nestjs/common';
import { AuthService } from '../../app/auth/auth.service';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';
import {
  AccountDeleteUser, AccountGetUserById,
  AccountLogin,
  AccountRefreshToken,
  AccountRegister,
  USER_PROFILE_DELETED,
  USER_PROFILE_DELETION_FAILED,
  UserProfileDeleted,
  UserProfileDeletionFailed,
} from '@tooly-rent/contracts';
import { LoggerService } from '@tooly-rent/common';
import { DeletionSaga } from '../../app/sagas/deletion.saga';

@Controller()
export class AuthController {
  private readonly logger = new LoggerService('AuthController');
  constructor(
    private readonly authService: AuthService,
    private readonly deletionSaga: DeletionSaga,
  ) {}

  @RMQRoute(AccountRegister.topic)
  @RMQValidate()
  async register(
    dto: AccountRegister.Request,
    @RMQMessage msg: Message,
  ): Promise<AccountRegister.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Registration request for: ${dto.email}`);
    try {
      const result = await this.authService.register(dto);
      this.logger.log(`[${requestId}][Auth Service] User created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[${requestId}][Auth Service] Registration failed for: ${dto.email}`);
      throw error;
    }
  }

  @RMQRoute(AccountLogin.topic)
  @RMQValidate()
  async login(
    dto: AccountLogin.Request,
    @RMQMessage msg: Message,
  ): Promise<AccountLogin.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Login request for: ${dto.email}`);
    try {
      const result = await this.authService.login(dto);
      this.logger.log(`[${requestId}][Auth Service] Login successful: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[${requestId}][Auth Service] Login failed:`, error.message);
      throw error;
    }
  }

  @RMQRoute(AccountGetUserById.topic)
  @RMQValidate()
  async getUserById(dto: AccountGetUserById.Request, @RMQMessage msg: Message) : Promise<AccountGetUserById.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] get user by id: ${dto.userId}`);
    try {
      const {id, email, role } = await this.authService.findById(dto.userId);
      this.logger.log(`[${requestId}][Auth Service] got user info successful`);
      return {id, email, role}
    }
    catch (e) {
      this.logger.error(`[${requestId}][Auth Service] getting info failed:`, e.message);
      throw e
    }
  }

  @RMQRoute(AccountRefreshToken.topic)
  @RMQValidate()
  async refresh(
    dto: AccountRefreshToken.Request,
    @RMQMessage msg: Message,
  ): Promise<AccountRefreshToken.Response> {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Refresh request for: ${requestId}`);
    try {
      const tokens = await this.authService.verifyToken(dto.refresh_token);
      this.logger.log(`[${requestId}][Auth Service] Refresh successful`);
      return tokens;
    } catch (e) {
      this.logger.error(`[${requestId}][Auth Service] Refresh failed:`, e.message);
      throw e;
    }
  }

  @RMQRoute(AccountDeleteUser.topic)
  @RMQValidate()
  async deleteUser(
    command: AccountDeleteUser.Request,
    @RMQMessage msg: Message,
  ) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] Start deleting user: ${requestId}`);
    return this.deletionSaga.startDeletion(command.userId);
  }

  @RMQRoute(USER_PROFILE_DELETED)
  async onProfileDeleted(
    event: UserProfileDeleted.Event,
    @RMQMessage msg: Message,
  ) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.log(`[${requestId}][Auth Service] User deleted: ${requestId}`);
    await this.deletionSaga.handleProfileDeleted(event.userId, event.sagaId);
  }

  @RMQRoute(USER_PROFILE_DELETION_FAILED)
  async onDeletionFailed(
    event: UserProfileDeletionFailed.Event,
    @RMQMessage msg: Message,
  ) {
    const requestId = msg.properties.headers?.requestId || 'unknown';
    this.logger.error(`[${requestId}][Auth Service] Deleting user failed:`);
    await this.deletionSaga.handleDeletionFailed(
      event.userId,
      event.sagaId,
      event.error,
    );
  }
}
