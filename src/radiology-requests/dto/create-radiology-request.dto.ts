import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRadiologyRequestDto {
  @IsInt()
  @IsNotEmpty()
  visitId: number;

  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsInt()
  @IsNotEmpty()
  doctorId: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
