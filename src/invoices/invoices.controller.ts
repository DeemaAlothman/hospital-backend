import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('CASHIER', 'ADMIN')
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @Roles('CASHIER', 'ADMIN')
  findAll(@Query() query: QueryInvoicesDto) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @Roles('CASHIER', 'ADMIN', 'RECEPTIONIST')
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
