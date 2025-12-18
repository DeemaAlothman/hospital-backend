import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PrescriptionStatus } from '@prisma/client';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
