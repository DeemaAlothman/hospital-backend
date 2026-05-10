import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus, ReservationType } from '@prisma/client';

export class QueryRoomReservationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsEnum(ReservationType)
  reservationType?: ReservationType;
}
