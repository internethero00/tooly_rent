import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace findAllBookings {
  export const topic = 'booking.find-all.query';

  export class Response {
    data?: IBooking[];
    total?: number;
    skip?: number;
    take?: number;
    hasMore?: boolean;
  }

  export class Request {
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsString()
    toolId?: string;

    @IsOptional()
    @IsString()
    renterId?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDateFrom?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDateTo?: Date;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    skip?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    take?: number;
  }
}
export interface IBooking {
  id: string;
  toolId: string;
  toolTitle: string;
  toolImage?: string;
  renterId: string;
  renterName?: string;
  startDate: Date;
  endDate: Date;
  pricePerDay: number;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}


