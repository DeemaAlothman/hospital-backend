import { IsInt, IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RadiologyResultItemDto {
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  report?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SubmitRadiologyResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RadiologyResultItemDto)
  results: RadiologyResultItemDto[];
}
