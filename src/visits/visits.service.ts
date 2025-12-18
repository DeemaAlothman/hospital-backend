import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { QueryVisitsDto } from './dto/query-visits.dto';

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
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let visitDate: Date | undefined;
    if (dto.visitDate) {
      visitDate = new Date(dto.visitDate);
      if (isNaN(visitDate.getTime()))
        throw new BadRequestException('Invalid visitDate');
    }

    return this.prisma.visit.create({
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
}
