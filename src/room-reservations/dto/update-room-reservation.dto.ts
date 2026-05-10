import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateRoomReservationDto {
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
