import { IsString, IsNotEmpty, IsDecimal, IsOptional } from 'class-validator';

export class CreateRadiologyTestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNotEmpty()
  price: number;
}
