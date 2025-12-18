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

export class CreateLabRequestItemDto {
  @IsInt()
  @Min(1)
  testId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLabRequestDto {
  @IsInt()
  @Min(1)
  visitId: number;

  @IsInt()
  @Min(1)
  patientId: number;

  @IsInt()
  @Min(1)
  doctorId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLabRequestItemDto)
  items: CreateLabRequestItemDto[];
}
