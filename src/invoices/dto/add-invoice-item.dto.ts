import { IsInt, IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class AddInvoiceItemDto {
  @IsEnum(['CONSULTATION', 'LAB', 'RADIOLOGY', 'PHARMACY', 'ROOM', 'OTHER'])
  @IsNotEmpty()
  itemType: string;

  @IsInt()
  @IsOptional()
  referenceId?: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;
}
