import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMedicineDto) {
    return this.prisma.medicine.create({
      data: {
        name: dto.name,
        category: dto.category,
        stock: dto.stock ?? 0,
        price: dto.price, // Prisma يقبل string للـ Decimal
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : undefined,
      },
    });
  }

  findAll(q?: string) {
    return this.prisma.medicine.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const med = await this.prisma.medicine.findUnique({ where: { id } });
    if (!med) throw new NotFoundException('Medicine not found');
    return med;
  }

  async update(id: number, dto: UpdateMedicineDto) {
    await this.findOne(id);
    return this.prisma.medicine.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        stock: dto.stock,
        price: dto.price,
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.medicine.delete({ where: { id } });
  }
}
