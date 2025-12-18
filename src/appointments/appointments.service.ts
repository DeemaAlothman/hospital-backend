import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const dateObj = new Date(dto.date);
    if (isNaN(dateObj.getTime())) throw new BadRequestException('Invalid date');

    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        date: dateObj,
        reason: dto.reason,
        status: dto.status ?? AppointmentStatus.SCHEDULED,
        notes: dto.notes,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });
  }

  findAll(query: QueryAppointmentsDto) {
    const where: any = {};

    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    return this.prisma.appointment.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    await this.findOne(id);

    // تحقق لو تغيّر patientId
    if (dto.patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: dto.patientId },
      });
      if (!patient) throw new NotFoundException('Patient not found');
    }

    // تحقق لو تغيّر doctorId
    if (dto.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: dto.doctorId },
      });
      if (!doctor) throw new NotFoundException('Doctor not found');
    }

    let dateObj: Date | undefined;
    if (dto.date) {
      dateObj = new Date(dto.date);
      if (isNaN(dateObj.getTime()))
        throw new BadRequestException('Invalid date');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        date: dateObj,
        reason: dto.reason,
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.appointment.delete({ where: { id } });
  }
}
