import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsNumberString,
} from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  // Prisma Decimal: الأفضل تبعتيها string مثل "3.50"
  @IsNumberString()
  price: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
