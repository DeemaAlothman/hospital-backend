import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  roomNumber: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nightlyRate?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
