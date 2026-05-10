import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReservationType } from '@prisma/client';

export class CreateRoomReservationDto {
  @IsInt()
  roomId: number;

  @IsOptional()
  @IsInt()
  bedId?: number;

  @IsOptional()
  @IsInt()
  patientId?: number;

  @IsInt()
  doctorId: number;

  @IsOptional()
  @IsInt()
  visitId?: number;

  @IsOptional()
  @IsInt()
  appointmentId?: number;

  @IsEnum(ReservationType)
  reservationType: ReservationType;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
