import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        fullName: dto.fullName,
        gender: dto.gender,
        birthDate: new Date(dto.birthDate),
        phone: dto.phone,
        address: dto.address,
        bloodType: dto.bloodType,
        emergencyContact: dto.emergencyContact,
      },
    });
  }

  findAll() {
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.patient.findUnique({
      where: { id },
    });
  }

  update(id: number, dto: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException(`Patient #${id} not found`);

    try {
      return await this.prisma.patient.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete patient with existing medical records (visits, appointments, invoices, etc.)',
        );
      }
      throw e;
    }
  }
}
