import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLabResultDto {
  @IsOptional()
  @IsString()
  resultValue?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  referenceRangeMin?: number;

  @IsOptional()
  @IsNumber()
  referenceRangeMax?: number;

  @IsOptional()
  @IsDateString()
  resultAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
