import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRadiologyRequestDto } from './dto/create-radiology-request.dto';
import { AddRadiologyItemDto } from './dto/add-radiology-item.dto';
import { SubmitRadiologyResultDto } from './dto/submit-radiology-result.dto';
import { QueryRadiologyRequestsDto } from './dto/query-radiology-requests.dto';
import { CreateMyRadiologyRequestDto } from './dto/create-my-radiology-request.dto';

@Injectable()
export class RadiologyRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createRadiologyRequestDto: CreateRadiologyRequestDto) {
    const { visitId, patientId, doctorId, notes } = createRadiologyRequestDto;

    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    return this.prisma.radiologyRequest.create({
      data: {
        visitId,
        patientId,
        doctorId,
        notes,
        status: 'PENDING',
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryRadiologyRequestsDto) {
    const { status, patientId, doctorId } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    return this.prisma.radiologyRequest.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid radiology request ID');
    }

    const request = await this.prisma.radiologyRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        visit: true,
        items: {
          include: {
            test: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Radiology request with ID ${id} not found`);
    }

    return request;
  }

  async addItems(id: number, addRadiologyItemDto: AddRadiologyItemDto) {
    const request = await this.findOne(id);

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Can only add items to pending requests');
    }

    const { testIds } = addRadiologyItemDto;

    // جلب بيانات الفحوصات
    const tests = await this.prisma.radiologyTest.findMany({
      where: { id: { in: testIds } },
    });

    if (tests.length !== testIds.length) {
      throw new BadRequestException('One or more radiology tests not found');
    }

    // إضافة الفحوصات وتحديث الفاتورة معاً
    return this.prisma.$transaction(async (tx) => {
      // إضافة الفحوصات للطلب
      const items = testIds.map((testId) => ({
        requestId: id,
        testId,
      }));

      await tx.radiologyRequestItem.createMany({
        data: items,
      });

      // البحث عن الفاتورة المعلقة للمريض
      const invoice = await tx.invoice.findFirst({
        where: {
          patientId: request.patientId,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!invoice) {
        throw new NotFoundException(
          'No pending invoice found for this patient',
        );
      }

      // إضافة بنود الأشعة للفاتورة
      let totalRadiologyCost = 0;
      for (const test of tests) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            itemType: 'RADIOLOGY',
            referenceId: test.id,
            description: `أشعة - ${test.name}`,
            quantity: 1,
            unitPrice: test.price,
            subTotal: test.price,
          },
        });
        totalRadiologyCost += Number(test.price);
      }

      // تحديث الفاتورة
      const newTotal = Number(invoice.totalAmount) + totalRadiologyCost;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          totalAmount: newTotal,
          finalAmount: newTotal - Number(invoice.discount),
        },
      });

      return this.findOne(id);
    });
  }

  async submitResults(id: number, submitResultDto: SubmitRadiologyResultDto) {
    const request = await this.findOne(id);

    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      throw new BadRequestException('Cannot submit results for this request');
    }

    const { results } = submitResultDto;

    for (const result of results) {
      const item = await this.prisma.radiologyRequestItem.findUnique({
        where: { id: result.itemId },
      });

      if (!item || item.requestId !== id) {
        throw new NotFoundException(`Item with ID ${result.itemId} not found in this request`);
      }

      await this.prisma.radiologyRequestItem.update({
        where: { id: result.itemId },
        data: {
          imageUrl: result.imageUrl,
          report: result.report,
          notes: result.notes,
          resultAt: new Date(),
        },
      });
    }

    const allItems = await this.prisma.radiologyRequestItem.findMany({
      where: { requestId: id },
    });

    const allCompleted = allItems.every((item) => item.resultAt !== null);

    if (allCompleted) {
      await this.prisma.radiologyRequest.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    } else {
      await this.prisma.radiologyRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);

    return this.prisma.radiologyRequest.update({
      where: { id },
      data: { status: status as any },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async createMyRadiologyRequest(userId: number, dto: CreateMyRadiologyRequestDto) {
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

    return this.prisma.radiologyRequest.create({
      data: {
        visitId: dto.visitId,
        patientId: visit.patientId,
        doctorId: doctor.id,
        notes: dto.notes,
        status: 'PENDING',
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async getMyRadiologyRequests(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor)
      throw new NotFoundException('Doctor profile not found for this user');

    return this.prisma.radiologyRequest.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }
}
