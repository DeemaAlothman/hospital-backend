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
    // 1) تأكد أن الـ user موجود
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2) منع التكرار (لأن userId unique في Doctor)
    const existing = await this.prisma.doctor.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException('This user is already a doctor');
    }

    // 3) (اختياري) اجبار أن role المستخدم DOCTOR
    // إذا ما بدك هذا الشرط، احذفيه.
    if (user.role !== UserRole.DOCTOR) {
      throw new BadRequestException('User role must be DOCTOR');
    }

    return this.prisma.doctor.create({
      data: {
        userId: dto.userId,
        speciality: dto.speciality,
      },
      include: {
        user: true,
      },
    });
  }

  findAll() {
    return this.prisma.doctor.findMany({
      include: { user: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
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
      include: { user: true },
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
        doctor: { include: { user: true } },
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
        doctor: { include: { user: true } },
      },
    });
  }
}
