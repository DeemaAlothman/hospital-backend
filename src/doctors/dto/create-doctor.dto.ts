import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDoctorDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsString()
  speciality?: string;
}
