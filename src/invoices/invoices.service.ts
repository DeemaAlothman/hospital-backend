import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceItemType } from '@prisma/client';
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

  async findAll(query: QueryInvoicesDto, forceItemType?: InvoiceItemType) {
    const { status, patientId, itemType } = query;

    const where: any = {};

    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const resolvedItemType = forceItemType ?? itemType;
    if (resolvedItemType) {
      where.items = { some: { itemType: resolvedItemType } };
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        patient: true,
        items: resolvedItemType
          ? { where: { itemType: resolvedItemType } }
          : true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resolvedItemType) return invoices;

    return invoices.map((inv) => ({
      ...inv,
      departmentTotal: inv.items.reduce(
        (sum, item) => sum + Number(item.subTotal),
        0,
      ),
    }));
  }

  async getDepartmentStats() {
    const types = Object.values(InvoiceItemType);
    const stats = await Promise.all(
      types.map(async (type) => {
        const items = await this.prisma.invoiceItem.aggregate({
          where: { itemType: type },
          _sum: { subTotal: true },
          _count: { id: true },
        });
        return {
          department: type,
          totalRevenue: items._sum.subTotal ?? 0,
          totalItems: items._count.id,
        };
      }),
    );
    return stats;
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
