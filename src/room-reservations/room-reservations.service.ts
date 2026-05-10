import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomReservationDto } from './dto/create-room-reservation.dto';
import { UpdateRoomReservationDto } from './dto/update-room-reservation.dto';
import { QueryRoomReservationsDto } from './dto/query-room-reservations.dto';

@Injectable()
export class RoomReservationsService {
  constructor(private prisma: PrismaService) {}

  // ─── helpers ────────────────────────────────────────────────────────────────

  private reservationInclude = {
    room: true,
    bed: true,
    patient: true,
    doctor: { include: { user: true } },
  } as const;

  async findOne(id: number) {
    const r = await this.prisma.roomReservation.findUnique({
      where: { id },
      include: this.reservationInclude,
    });
    if (!r) throw new NotFoundException(`RoomReservation with ID ${id} not found`);
    return r;
  }

  // ─── create ─────────────────────────────────────────────────────────────────

  async create(dto: CreateRoomReservationDto) {
    const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException(`Room ${dto.roomId} not found`);

    // سيناريو 5: غرفة الصيانة
    if (room.status === 'UNDER_MAINTENANCE') {
      throw new BadRequestException(`Room ${room.roomNumber} is under maintenance`);
    }

    const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
    if (!doctor) throw new NotFoundException(`Doctor ${dto.doctorId} not found`);

    if (dto.patientId) {
      const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
      if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    // سيناريو 6: منع الحجز المزدوج
    const overlapWhere: any = {
      roomId: dto.roomId,
      status: { in: ['RESERVED', 'ACTIVE'] },
      AND: [
        { startDate: { lt: endDate ?? new Date('9999-12-31') } },
        { OR: [{ endDate: null }, { endDate: { gt: startDate } }] },
      ],
    };

    const overlap = await this.prisma.roomReservation.findFirst({
      where: overlapWhere,
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });

    if (overlap) {
      const holder =
        overlap.patient?.fullName ?? overlap.doctor.user.fullName;
      throw new ConflictException(
        `Room ${room.roomNumber} is already reserved by "${holder}" during that period`,
      );
    }

    return this.prisma.roomReservation.create({
      data: {
        roomId: dto.roomId,
        bedId: dto.bedId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        visitId: dto.visitId,
        appointmentId: dto.appointmentId,
        reservationType: dto.reservationType,
        startDate,
        endDate,
        notes: dto.notes,
        status: 'RESERVED',
      },
      include: this.reservationInclude,
    });
  }

  // ─── findAll ─────────────────────────────────────────────────────────────────

  findAll(query: QueryRoomReservationsDto) {
    const where: any = {};
    if (query.roomId) where.roomId = query.roomId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.status) where.status = query.status;
    if (query.reservationType) where.reservationType = query.reservationType;

    return this.prisma.roomReservation.findMany({
      where,
      include: this.reservationInclude,
      orderBy: { startDate: 'desc' },
    });
  }

  // ─── activate (RESERVED → ACTIVE) ────────────────────────────────────────────

  async activate(id: number) {
    const reservation = await this.findOne(id);

    if (reservation.status !== 'RESERVED') {
      throw new BadRequestException(
        `Reservation is "${reservation.status}", can only activate RESERVED reservations`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' },
      });

      if (reservation.bedId) {
        await tx.bed.update({
          where: { id: reservation.bedId },
          data: { status: 'OCCUPIED' },
        });
      }

      return tx.roomReservation.update({
        where: { id },
        data: { status: 'ACTIVE' },
        include: this.reservationInclude,
      });
    });
  }

  // ─── complete (ACTIVE → COMPLETED) ───────────────────────────────────────────
  // سيناريو 7: ربط تكلفة الغرفة بالفاتورة تلقائياً

  async complete(id: number) {
    const reservation = await this.findOne(id);

    if (reservation.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Reservation is "${reservation.status}", can only complete ACTIVE reservations`,
      );
    }

    const endDate = new Date();

    return this.prisma.$transaction(async (tx) => {
      // تحرير الغرفة والسرير أولاً
      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' },
      });

      if (reservation.bedId) {
        await tx.bed.update({
          where: { id: reservation.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      const updated = await tx.roomReservation.update({
        where: { id },
        data: { status: 'COMPLETED', endDate },
        include: this.reservationInclude,
      });

      // ربط التكلفة بالفاتورة للمرضى فقط (PatientStay)
      if (
        reservation.reservationType === 'PATIENT_STAY' &&
        reservation.patientId
      ) {
        const invoice = await tx.invoice.findFirst({
          where: { patientId: reservation.patientId, status: 'PENDING' },
        });

        if (invoice) {
          const startDate = reservation.startDate;
          const nights = Math.max(
            1,
            Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          );
          const nightlyRate = Number(reservation.room.nightlyRate);
          const subTotal = nights * nightlyRate;

          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              itemType: 'ROOM',
              referenceId: id,
              description: `Room ${reservation.room.roomNumber} - ${reservation.room.type} - ${nights} night(s)`,
              quantity: nights,
              unitPrice: nightlyRate,
              subTotal,
            },
          });

          const newTotal = Number(invoice.totalAmount) + subTotal;
          const newFinal = newTotal - Number(invoice.discount);

          await tx.invoice.update({
            where: { id: invoice.id },
            data: { totalAmount: newTotal, finalAmount: newFinal },
          });
        }
      }

      return updated;
    });
  }

  // ─── cancel ───────────────────────────────────────────────────────────────────

  async cancel(id: number) {
    const reservation = await this.findOne(id);

    if (!['RESERVED', 'ACTIVE'].includes(reservation.status)) {
      throw new BadRequestException(
        `Reservation is already "${reservation.status}"`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // تحرير الغرفة والسرير أولاً إذا كانت محجوزة
      if (reservation.status === 'ACTIVE') {
        await tx.room.update({
          where: { id: reservation.roomId },
          data: { status: 'AVAILABLE' },
        });

        if (reservation.bedId) {
          await tx.bed.update({
            where: { id: reservation.bedId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      return tx.roomReservation.update({
        where: { id },
        data: { status: 'CANCELLED', endDate: new Date() },
        include: this.reservationInclude,
      });
    });
  }

  // ─── update (notes / endDate فقط) ────────────────────────────────────────────

  async update(id: number, dto: UpdateRoomReservationDto) {
    await this.findOne(id);
    return this.prisma.roomReservation.update({
      where: { id },
      data: {
        notes: dto.notes,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: this.reservationInclude,
    });
  }
}
