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

export class CreateMyLabRequestItemDto {
  @IsInt()
  @Min(1)
  testId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMyLabRequestDto {
  @IsInt()
  @Min(1)
  visitId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMyLabRequestItemDto)
  items: CreateMyLabRequestItemDto[];
}
