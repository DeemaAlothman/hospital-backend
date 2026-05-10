import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RoomType, RoomStatus } from '@prisma/client';

export class UpdateRoomDto {
  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nightlyRate?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
