import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateLabResultDto {
  @IsOptional()
  @IsString()
  resultValue?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsDateString()
  resultAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
