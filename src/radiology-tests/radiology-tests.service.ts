import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRadiologyTestDto } from './dto/create-radiology-test.dto';
import { UpdateRadiologyTestDto } from './dto/update-radiology-test.dto';

@Injectable()
export class RadiologyTestsService {
  constructor(private prisma: PrismaService) {}

  async create(createRadiologyTestDto: CreateRadiologyTestDto) {
    return this.prisma.radiologyTest.create({
      data: createRadiologyTestDto,
    });
  }

  async findAll() {
    return this.prisma.radiologyTest.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const test = await this.prisma.radiologyTest.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException(`Radiology test with ID ${id} not found`);
    }

    return test;
  }

  async update(id: number, updateRadiologyTestDto: UpdateRadiologyTestDto) {
    await this.findOne(id);

    return this.prisma.radiologyTest.update({
      where: { id },
      data: updateRadiologyTestDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.radiologyTest.delete({
      where: { id },
    });
  }
}
