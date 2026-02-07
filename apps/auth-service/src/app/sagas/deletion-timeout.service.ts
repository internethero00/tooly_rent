import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountStatus } from '../../domain/entities/user.entity';

@Injectable()
export class DeletionTimeoutService {
  private readonly logger = new Logger(DeletionTimeoutService.name);
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkStaleSagas() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const staleUsers =
      await this.userRepository.findStaleDeletions(fiveMinutesAgo);
    for (const user of staleUsers) {
      this.logger.warn(
        `Saga ${user.deletionSagaId}: timed out for user ${user.id}, rolling back`,
      );

      await this.userRepository.update(user.id, {
        status: AccountStatus.ACTIVE,
        deletionSagaId: null,
        deletionRequestedAt: null,
      });
    }
  }
}
