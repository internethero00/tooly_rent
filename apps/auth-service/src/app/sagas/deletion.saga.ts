import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { RMQService } from 'nestjs-rmq';
import { AccountStatus } from '../../domain/entities/user.entity';
import { ACCOUNT_DELETION_STARTED, AccountUserDeletionStarted } from '@tooly-rent/contracts';


@Injectable()
export class DeletionSaga {
  private readonly logger = new Logger(DeletionSaga.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly rmqService: RMQService,
  ) {}

  async startDeletion(userId: string): Promise<{ sagaId: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isPendingDeletion) {
      throw new Error('Deletion already in progress');
    }
    const sagaId = uuid();

    await this.userRepository.update(userId, {
      status: AccountStatus.PENDING_DELETION,
      deletionSagaId: sagaId,
      deletionRequestedAt: new Date(),
    });

    this.logger.log(`Saga ${sagaId}: deletion started for user ${userId}`);

    await this.rmqService.notify<AccountUserDeletionStarted.Event>(
      ACCOUNT_DELETION_STARTED,
      {
        userId: userId,
        sagaId,
      },
    );

    return { sagaId };
  }

  async handleProfileDeleted(userId: string, sagaId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.deletionSagaId !== sagaId) {
      this.logger.warn(`Saga ${sagaId}: stale event, skipping`);
      return;
    }

    await this.userRepository.delete(userId);

    this.logger.log(`Saga ${sagaId}: user ${userId} fully deleted`);
  }

  async handleDeletionFailed(
    userId: string,
    sagaId: string,
    error: string,
  ): Promise<void> {
    this.logger.error(`Saga ${sagaId}: failed — ${error}`);

    const user = await this.userRepository.findById(userId);

    if (!user || user.deletionSagaId !== sagaId) {
      return;
    }

    await this.userRepository.update(userId, {
      status: AccountStatus.ACTIVE,
      deletionSagaId: null,
      deletionRequestedAt: null,
    });
  }
}
