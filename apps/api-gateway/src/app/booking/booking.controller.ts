import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { Authorization } from '../decorators/auth.decorator';
import { UserRole } from '../decorators/roles.decorator';
import { LoggerService } from '@tooly-rent/common';
import { AuthenticatedRequest } from '../types/authenticatedRequest.type';
import { findAllBookings } from '@tooly-rent/contracts';

@Controller('booking')
export class BookingController {
  private readonly logger = new LoggerService(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Authorization(UserRole.USER)
  @Get('my')
  async findAll(@Req() req: AuthenticatedRequest) {
    const requestId = req['requestId'] as string;
    const timestamp = new Date().toISOString();
    const userId = req.user.sub;
    this.logger.log(`Find All bookings ${userId}`, requestId);
    try {
      const result = await this.bookingService.findAll(
        { userId },
        requestId,
        timestamp,
      );
      this.logger.log(
        `Find All bookings with id ${userId} successful`,
        requestId,
      );
      return result;
    } catch (e) {
      this.logger.error(
        `Find All bookings with id ${userId} failed`,
        e.stack,
        requestId,
      );
      throw e;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }
}
