import { Controller } from '@nestjs/common';
import { UsersService } from '../../app/users/users.service';
import { RMQRoute } from 'nestjs-rmq';
import {
  ACCOUNT_DELETION_STARTED,
  AccountUserDeletionStarted,
} from '@tooly-rent/contracts';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RMQRoute(ACCOUNT_DELETION_STARTED)
  async deleteUserById(event: AccountUserDeletionStarted.Event) {
    await this.usersService.deleteUserById(event)
  }
}
