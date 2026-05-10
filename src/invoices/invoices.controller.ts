import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoiceItemType, UserRole } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

const ROLE_ITEM_TYPE: Partial<Record<UserRole, InvoiceItemType>> = {
  [UserRole.PHARMACIST]: InvoiceItemType.PHARMACY,
  [UserRole.LAB_TECH]: InvoiceItemType.LAB,
  [UserRole.RADIOLOGY_TECH]: InvoiceItemType.RADIOLOGY,
};

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('CASHIER', 'ADMIN')
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get('stats')
  @Roles('ADMIN')
  getDepartmentStats() {
    return this.invoicesService.getDepartmentStats();
  }

  @Get()
  @Roles('CASHIER', 'ADMIN', 'PHARMACIST', 'LAB_TECH', 'RADIOLOGY_TECH')
  findAll(@Query() query: QueryInvoicesDto, @GetUser() user: any) {
    const forceItemType = ROLE_ITEM_TYPE[user.role as UserRole];
    return this.invoicesService.findAll(query, forceItemType);
  }

  @Get(':id')
  @Roles('CASHIER', 'ADMIN', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'RADIOLOGY_TECH')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }

  @Post(':id/items')
  @Roles('CASHIER', 'ADMIN')
  addItem(@Param('id') id: string, @Body() addInvoiceItemDto: AddInvoiceItemDto) {
    return this.invoicesService.addItem(+id, addInvoiceItemDto);
  }

  @Post(':id/pay')
  @Roles('CASHIER', 'ADMIN')
  pay(@Param('id') id: string) {
    return this.invoicesService.pay(+id);
  }
}
