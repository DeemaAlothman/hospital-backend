import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LabRequestStatus } from '@prisma/client';

export class UpdateLabRequestDto {
  @IsOptional()
  @IsEnum(LabRequestStatus)
  status?: LabRequestStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
