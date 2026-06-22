import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomsDto } from './dto/query-rooms.dto';
import { CreateBedDto } from './dto/create-bed.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    const existing = await this.prisma.room.findUnique({
      where: { roomNumber: dto.roomNumber },
    });
    if (existing) {
      throw new ConflictException(`Room number "${dto.roomNumber}" already exists`);
    }

    return this.prisma.room.create({
      data: {
        roomNumber: dto.roomNumber,
        type: dto.type,
        floor: dto.floor,
        nightlyRate: dto.nightlyRate ?? 0,
        description: dto.description,
      },
      include: { beds: true },
    });
  }

  findAll(query: QueryRoomsDto) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.floor !== undefined) where.floor = query.floor;

    return this.prisma.room.findMany({
      where,
      include: { beds: true },
      orderBy: { roomNumber: 'asc' },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        beds: true,
        reservations: {
          where: { status: { in: ['RESERVED', 'ACTIVE'] } },
          include: {
            patient: true,
            doctor: { include: { user: { omit: { password: true } } } },
          },
        },
      },
    });
    if (!room) throw new NotFoundException(`Room with ID ${id} not found`);
    return room;
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.room.update({
      where: { id },
      data: dto,
      include: { beds: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const activeReservation = await this.prisma.roomReservation.findFirst({
      where: { roomId: id, status: { in: ['RESERVED', 'ACTIVE'] } },
    });
    if (activeReservation) {
      throw new BadRequestException('Cannot delete a room with active reservations');
    }

    return this.prisma.room.delete({ where: { id } });
  }

  async addBed(roomId: number, dto: CreateBedDto) {
    await this.findOne(roomId);

    const existing = await this.prisma.bed.findUnique({
      where: { roomId_bedNumber: { roomId, bedNumber: dto.bedNumber } },
    });
    if (existing) {
      throw new ConflictException(`Bed "${dto.bedNumber}" already exists in this room`);
    }

    return this.prisma.bed.create({
      data: { roomId, bedNumber: dto.bedNumber },
    });
  }

  async toggleMaintenance(id: number) {
    const room = await this.findOne(id);

    if (room.status === 'OCCUPIED') {
      throw new BadRequestException('Cannot set an occupied room to maintenance');
    }

    const newStatus =
      room.status === 'UNDER_MAINTENANCE' ? 'AVAILABLE' : 'UNDER_MAINTENANCE';

    return this.prisma.room.update({
      where: { id },
      data: { status: newStatus },
      include: { beds: true },
    });
  }
}

