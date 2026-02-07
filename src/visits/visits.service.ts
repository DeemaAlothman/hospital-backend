import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { QueryVisitsDto } from './dto/query-visits.dto';
import { CreateMyVisitDto } from './dto/create-my-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVisitDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { user: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let visitDate: Date | undefined;
    if (dto.visitDate) {
      visitDate = new Date(dto.visitDate);
      if (isNaN(visitDate.getTime()))
        throw new BadRequestException('Invalid visitDate');
    }

    // إنشاء الزيارة والفاتورة معاً (transaction)
    const result = await this.prisma.$transaction(async (tx) => {
      // إنشاء الزيارة
      const visit = await tx.visit.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          visitDate,
          diagnosis: dto.diagnosis,
          chiefComplaint: dto.chiefComplaint,
          notes: dto.notes,
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });

      // سعر الكشفية (من المستخدم أو قيمة افتراضية)
      const consultationFee = 50; // يمكن أن تكون من إعدادات النظام أو من جدول الدكتور

      // إنشاء الفاتورة
      const invoice = await tx.invoice.create({
        data: {
          patientId: dto.patientId,
          status: 'PENDING',
          totalAmount: consultationFee,
          finalAmount: consultationFee,
          discount: 0,
        },
      });

      // إضافة بند الكشفية للفاتورة
      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          itemType: 'CONSULTATION',
          referenceId: visit.id,
          description: `كشفية - د. ${doctor.user.fullName}`,
          quantity: 1,
          unitPrice: consultationFee,
          subTotal: consultationFee,
        },
      });

      return visit;
    });

    return result;
  }

  findAll(query: QueryVisitsDto) {
    const where: any = {};

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;

    if (query.from || query.to) {
      where.visitDate = {};
      if (query.from) where.visitDate.gte = new Date(query.from);
      if (query.to) where.visitDate.lte = new Date(query.to);
    }

    return this.prisma.visit.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid visit ID');
    }

    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        // لاحقاً رح ينعبي:
        prescriptions: { include: { items: { include: { medicine: true } } } },
        labRequests: { include: { items: { include: { test: true } } } },
        radiologyRequests: { include: { items: { include: { test: true } } } },
      },
    });

    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  async update(id: number, dto: UpdateVisitDto) {
    await this.findOne(id);

    let visitDate: Date | undefined;
    if (dto.visitDate) {
      visitDate = new Date(dto.visitDate);
      if (isNaN(visitDate.getTime()))
        throw new BadRequestException('Invalid visitDate');
    }

    return this.prisma.visit.update({
      where: { id },
      data: {
        // عادة ما منغير patientId/doctorId بعد إنشاء الزيارة
        diagnosis: dto.diagnosis,
        chiefComplaint: dto.chiefComplaint,
        notes: dto.notes,
        visitDate,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.visit.delete({ where: { id } });
  }

  async createMyVisit(userId: number, dto: CreateMyVisitDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!doctor)
      throw new NotFoundException('Doctor profile not found for this user');

    let visitDate: Date | undefined;
    if (dto.visitDate) {
      visitDate = new Date(dto.visitDate);
      if (isNaN(visitDate.getTime()))
        throw new BadRequestException('Invalid visitDate');
    }

    // إنشاء الزيارة والفاتورة معاً (transaction)
    const result = await this.prisma.$transaction(async (tx) => {
      // إنشاء الزيارة
      const visit = await tx.visit.create({
        data: {
          patientId: dto.patientId,
          doctorId: doctor.id,
          visitDate,
          diagnosis: dto.diagnosis,
          chiefComplaint: dto.chiefComplaint,
          notes: dto.notes,
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });

      // سعر الكشفية
      const consultationFee = 50;

      // إنشاء الفاتورة
      const invoice = await tx.invoice.create({
        data: {
          patientId: dto.patientId,
          status: 'PENDING',
          totalAmount: consultationFee,
          finalAmount: consultationFee,
          discount: 0,
        },
      });

      // إضافة بند الكشفية للفاتورة
      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          itemType: 'CONSULTATION',
          referenceId: visit.id,
          description: `كشفية - د. ${doctor.user.fullName}`,
          quantity: 1,
          unitPrice: consultationFee,
          subTotal: consultationFee,
        },
      });

      return visit;
    });

    return result;
  }
}
