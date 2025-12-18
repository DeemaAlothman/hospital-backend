import { IsOptional, IsEnum } from 'class-validator';

export class QueryUsersDto {
  @IsOptional()
  @IsEnum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECH', 'RADIOLOGY_TECH', 'PHARMACIST', 'CASHIER'])
  role?: string;

  @IsOptional()
  search?: string;
}
