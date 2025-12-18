import { IsOptional, IsString } from 'class-validator';
import { IsDecimal } from 'class-validator';

export class CreateLabTestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  // Prisma Decimal يفضل يجي String من Postman
  @IsDecimal()
  price: string;
}
