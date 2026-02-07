import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabRequestDto } from './dto/create-lab-request.dto';
import { UpdateLabRequestDto } from './dto/update-lab-request.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';
import { QueryLabRequestsDto } from './dto/query-lab-requests.dto';
import { CreateMyLabRequestDto } from './dto/create-my-lab-request.dto';
import { LabRequestStatus } from '@prisma/client';

@Injectable()
export class LabRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLabRequestDto) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: dto.visitId },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    if (visit.patientId !== dto.patientId) {
      throw new BadRequestException('patientId does not match the visit');
    }
    if (visit.doctorId !== dto.doctorId) {
      throw new BadRequestException('doctorId does not match the visit');
    }

    const testIds = dto.items.map((i) => i.testId);
    const tests = await this.prisma.labTest.findMany({
      where: { id: { in: testIds } },
    });
    if (tests.length !== testIds.length) {
      throw new BadRequestException('One or more lab tests not found');
    }

    // إنشاء طلب التحليل وإضافة بنود الفاتورة معاً
    return this.prisma.$transaction(async (tx) => {
      // إنشاء طلب التحليل
      const labRequest = await tx.labRequest.create({
        data: {
          visitId: dto.visitId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          status: LabRequestStatus.PENDING,
          notes: dto.notes,
          items: {
            create: dto.items.map((i) => ({
              testId: i.testId,
              notes: i.notes,
            })),
          },
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          visit: true,
          items: { include: { test: true } },
        },
      });

      // البحث عن الفاتورة المعلقة للمريض
      const invoice = await tx.invoice.findFirst({
        where: {
          patientId: dto.patientId,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!invoice) {
        throw new NotFoundException(
          'No pending invoice found for this patient',
        );
      }

      // إضافة بنود التحاليل للفاتورة
      let totalLabCost = 0;
      for (const item of labRequest.items) {
        const test = tests.find((t) => t.id === item.testId);
        if (test) {
          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              itemType: 'LAB',
              referenceId: item.id,
              description: `تحليل - ${test.name}`,
              quantity: 1,
              unitPrice: test.price,
              subTotal: test.price,
            },
          });
          totalLabCost += Number(test.price);
        }
      }

      // تحديث الفاتورة
      const newTotal = Number(invoice.totalAmount) + totalLabCost;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          totalAmount: newTotal,
          finalAmount: newTotal - Number(invoice.discount),
        },
      });

      return labRequest;
    });
  }

  findAll(query: QueryLabRequestsDto) {
    const where: any = {};

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.visitId) where.visitId = query.visitId;
    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    return this.prisma.labRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { test: true } },
      },
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid lab request ID');
    }

    const req = await this.prisma.labRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { test: true } },
      },
    });
    if (!req) throw new NotFoundException('Lab request not found');
    return req;
  }

  async update(id: number, dto: UpdateLabRequestDto) {
    await this.findOne(id);
    return this.prisma.labRequest.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { test: true } },
      },
    });
  }

  async updateResult(
    requestId: number,
    itemId: number,
    dto: UpdateLabResultDto,
  ) {
    await this.findOne(requestId);

    const item = await this.prisma.labRequestItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.requestId !== requestId) {
      throw new NotFoundException(
        'Lab request item not found for this request',
      );
    }

    return this.prisma.labRequestItem.update({
      where: { id: itemId },
      data: {
        resultValue: dto.resultValue,
        unit: dto.unit,
        referenceRange: dto.referenceRange,
        resultAt: dto.resultAt ? new Date(dto.resultAt) : undefined,
        notes: dto.notes,
      },
      include: {
        test: true,
        request: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.labRequestItem.deleteMany({ where: { requestId: id } });
    return this.prisma.labRequest.delete({ where: { id } });
  }

  async createMyLabRequest(userId: number, dto: CreateMyLabRequestDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor)
      throw new NotFoundException('Doctor profile not found for this user');

    const visit = await this.prisma.visit.findUnique({
      where: { id: dto.visitId },
      include: { patient: true },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    if (visit.doctorId !== doctor.id) {
      throw new BadRequestException(
        'This visit does not belong to the current doctor',
      );
    }

    const testIds = dto.items.map((i) => i.testId);
    const tests = await this.prisma.labTest.findMany({
      where: { id: { in: testIds } },
    });
    if (tests.length !== testIds.length) {
      throw new BadRequestException('One or more lab tests not found');
    }

    // إنشاء طلب التحليل وإضافة بنود الفاتورة معاً
    return this.prisma.$transaction(async (tx) => {
      // إنشاء طلب التحليل
      const labRequest = await tx.labRequest.create({
        data: {
          visitId: dto.visitId,
          patientId: visit.patientId,
          doctorId: doctor.id,
          status: LabRequestStatus.PENDING,
          notes: dto.notes,
          items: {
            create: dto.items.map((i) => ({
              testId: i.testId,
              notes: i.notes,
            })),
          },
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          visit: true,
          items: { include: { test: true } },
        },
      });

      // البحث عن الفاتورة المعلقة للمريض
      const invoice = await tx.invoice.findFirst({
        where: {
          patientId: visit.patientId,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!invoice) {
        throw new NotFoundException(
          'No pending invoice found for this patient',
        );
      }

      // إضافة بنود التحاليل للفاتورة
      let totalLabCost = 0;
      for (const item of labRequest.items) {
        const test = tests.find((t) => t.id === item.testId);
        if (test) {
          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              itemType: 'LAB',
              referenceId: item.id,
              description: `تحليل - ${test.name}`,
              quantity: 1,
              unitPrice: test.price,
              subTotal: test.price,
            },
          });
          totalLabCost += Number(test.price);
        }
      }

      // تحديث الفاتورة
      const newTotal = Number(invoice.totalAmount) + totalLabCost;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          totalAmount: newTotal,
          finalAmount: newTotal - Number(invoice.discount),
        },
      });

      return labRequest;
    });
  }

  async getMyLabRequests(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor)
      throw new NotFoundException('Doctor profile not found for this user');

    return this.prisma.labRequest.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { test: true } },
      },
    });
  }
}
