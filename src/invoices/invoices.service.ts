import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { patientId, discount } = createInvoiceDto;

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    return this.prisma.invoice.create({
      data: {
        patientId,
        discount: discount || 0,
        status: 'PENDING',
        totalAmount: 0,
        finalAmount: 0,
      },
      include: {
        patient: true,
        items: true,
      },
    });
  }

  async findAll(query: QueryInvoicesDto) {
    const { status, patientId } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        patient: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async addItem(id: number, addInvoiceItemDto: AddInvoiceItemDto) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'PENDING') {
      throw new BadRequestException('Can only add items to pending invoices');
    }

    const { itemType, referenceId, description, quantity, unitPrice } = addInvoiceItemDto;

    const subTotal = quantity * unitPrice;

    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId: id,
        itemType: itemType as any,
        referenceId,
        description,
        quantity,
        unitPrice,
        subTotal,
      },
    });

    const totalAmount = invoice.totalAmount.toNumber() + subTotal;
    const finalAmount = totalAmount - invoice.discount.toNumber();

    await this.prisma.invoice.update({
      where: { id },
      data: {
        totalAmount,
        finalAmount,
      },
    });

    return this.findOne(id);
  }

  async pay(id: number) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'PENDING') {
      throw new BadRequestException('Invoice is not pending');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
      },
      include: {
        patient: true,
        items: true,
      },
    });
  }

  async cancel(id: number) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending invoices');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        patient: true,
        items: true,
      },
    });
  }
}
