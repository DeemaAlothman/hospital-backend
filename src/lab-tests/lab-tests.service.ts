import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';

@Injectable()
export class LabTestsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLabTestDto) {
    return this.prisma.labTest.create({
      data: {
        name: dto.name,
        category: dto.category,
        price: dto.price as any, // Prisma Decimal accepts string
      },
    });
  }

  findAll() {
    return this.prisma.labTest.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const test = await this.prisma.labTest.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Lab test not found');
    return test;
  }

  async update(id: number, dto: UpdateLabTestDto) {
    await this.findOne(id);
    return this.prisma.labTest.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        price: dto.price ? (dto.price as any) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.labTest.delete({ where: { id } });
  }
}
