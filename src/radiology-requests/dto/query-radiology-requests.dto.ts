import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRadiologyRequestsDto {
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;
}
