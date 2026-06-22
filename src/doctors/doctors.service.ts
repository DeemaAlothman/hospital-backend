import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDoctorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.DOCTOR)
      throw new BadRequestException('User role must be DOCTOR');

    // upsert: إذا عنده doctor record بنحدث الاختصاص، إذا ما عنده بنضيفه
    return this.prisma.doctor.upsert({
      where: { userId: dto.userId },
      update: { speciality: dto.speciality },
      create: { userId: dto.userId, speciality: dto.speciality },
      include: { user: { omit: { password: true } } },
    });
  }

  findAll() {
    return this.prisma.doctor.findMany({
      include: { user: { omit: { password: true } } },
      orderBy: { id: 'desc' },
    });
  }

  // كل المستخدمين role=DOCTOR اللي ما عندهم اختصاص بعد (سواء ما عندهم doctor record أو عندهم بس speciality فاضي)
  async findUnassigned() {
    // الحالة 1: users مع role=DOCTOR بس ما عندهم Doctor record أصلاً
    const usersWithoutDoctorRecord = await this.prisma.user.findMany({
      where: {
        role: UserRole.DOCTOR,
        doctor: { is: null },
      },
      select: { id: true, fullName: true, email: true, phone: true },
    });

    // الحالة 2: عندهم Doctor record بس speciality فاضي
    const doctorsWithoutSpeciality = await this.prisma.doctor.findMany({
      where: { speciality: null },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    const fromCase2 = doctorsWithoutSpeciality.map((d) => ({
      ...d.user,
      doctorId: d.id,
    }));

    return [...usersWithoutDoctorRecord, ...fromCase2];
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: { omit: { password: true } } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async update(id: number, dto: UpdateDoctorDto) {
    await this.findOne(id);

    return this.prisma.doctor.update({
      where: { id },
      data: {
        speciality: dto.speciality,
      },
      include: { user: { omit: { password: true } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.doctor.delete({
      where: { id },
    });
  }

  async getVisits(
    id: number,
    currentUserId: number,
    currentUserRole: string,
  ) {
    await this.findOne(id);

    // إذا لم يكن ADMIN، تحقق من أن الطبيب يطلب زياراته فقط
    if (currentUserRole !== 'ADMIN') {
      const currentDoctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUserId },
      });

      if (!currentDoctor || currentDoctor.id !== id) {
        throw new BadRequestException(
          'You can only access your own visits',
        );
      }
    }

    return this.prisma.visit.findMany({
      where: { doctorId: id },
      orderBy: { visitDate: 'desc' },
      include: {
        patient: true,
        doctor: { include: { user: { omit: { password: true } } } },
      },
    });
  }

  async getMyVisits(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }

    return this.prisma.visit.findMany({
      where: { doctorId: doctor.id },
      orderBy: { visitDate: 'desc' },
      include: {
        patient: true,
        doctor: { include: { user: { omit: { password: true } } } },
      },
    });
  }
}

