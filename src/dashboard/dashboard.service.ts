import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [staff, doctors, visits, appointments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.doctor.count(),
      this.prisma.visit.count(),
      this.prisma.appointment.count(),
    ]);

    return { staff, doctors, visits, appointments };
  }
}
