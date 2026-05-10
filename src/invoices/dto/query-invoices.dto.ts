import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceItemType } from '@prisma/client';

export class QueryInvoicesDto {
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @IsEnum(InvoiceItemType)
  itemType?: InvoiceItemType;
}
