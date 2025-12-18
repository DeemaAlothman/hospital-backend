import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { QueryPrescriptionsDto } from './dto/query-prescriptions.dto';
import { PrescriptionStatus } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: dto.visitId },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    // ✅ منع عدم التطابق (لتفادي بيانات غلط)
    if (visit.patientId !== dto.patientId) {
      throw new BadRequestException('patientId does not match the visit');
    }
    if (visit.doctorId !== dto.doctorId) {
      throw new BadRequestException('doctorId does not match the visit');
    }

    // تأكد medicines موجودين
    const medicineIds = dto.items.map((i) => i.medicineId);
    const meds = await this.prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });
    if (meds.length !== medicineIds.length) {
      throw new BadRequestException('One or more medicines not found');
    }

    return this.prisma.prescription.create({
      data: {
        visitId: dto.visitId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        status: PrescriptionStatus.ACTIVE,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            medicineId: i.medicineId,
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
          })),
        },
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { medicine: true } },
      },
    });
  }

  findAll(query: QueryPrescriptionsDto) {
    const where: any = {};

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    return this.prisma.prescription.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { medicine: true } },
      },
    });
  }

  async findOne(id: number) {
    const p = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { medicine: true } },
      },
    });
    if (!p) throw new NotFoundException('Prescription not found');
    return p;
  }

  async update(id: number, dto: UpdatePrescriptionDto) {
    await this.findOne(id);

    return this.prisma.prescription.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        visit: true,
        items: { include: { medicine: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Cascade مش مفعل افتراضياً، بس Prisma رح يحذف items إذا علاقة onDelete موجودة،
    // إذا مو موجودة: بنحذف items أولاً.
    await this.prisma.prescriptionItem.deleteMany({
      where: { prescriptionId: id },
    });
    return this.prisma.prescription.delete({ where: { id } });
  }
}
