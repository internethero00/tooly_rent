import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { findAllBookings } from '@tooly-rent/contracts';

@Injectable()
export class BookingService {
  constructor(private readonly rmqService: RMQService) {}

  create(createBookingDto: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  async findAll(
    dto: findAllBookings.Request,
    requestId?: string,
    timestamp?: string,
  ): Promise<findAllBookings.Response> {
    return this.rmqService.send<
      findAllBookings.Request,
      findAllBookings.Response
    >(findAllBookings.topic, dto, {
      headers: { requestId, timestamp, service: 'api-gateway' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
