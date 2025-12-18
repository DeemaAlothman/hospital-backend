import { IsInt, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsNumber()
  @IsOptional()
  discount?: number;
}
