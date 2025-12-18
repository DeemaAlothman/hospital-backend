import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsString()
  fullName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  birthDate: string; // نرجع نحولها لـ Date في الـ service

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;
}
