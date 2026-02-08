import { Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { LoggerService } from '@tooly-rent/common';
import { UserService } from './user.service';
import {UpdateUserDto} from "./dto/update.user.dto";

@Controller('users')
export class UserController {
  private readonly logger = new LoggerService(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {}

  @Get(':id')
  async getUserById(@Param('id') id: string) {}

  @Put(':id')
  async updateUserById(@Param('id') id: string, dto: UpdateUserDto) {}

}
