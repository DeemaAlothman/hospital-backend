import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMyRadiologyRequestDto {
  @IsInt()
  @IsNotEmpty()
  visitId: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
