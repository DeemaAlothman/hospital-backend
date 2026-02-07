import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMyPrescriptionItemDto {
  @IsInt()
  @Min(1)
  medicineId: number;

  @IsString()
  dosage: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;
}

export class CreateMyPrescriptionDto {
  @IsInt()
  @Min(1)
  visitId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMyPrescriptionItemDto)
  items: CreateMyPrescriptionItemDto[];
}
