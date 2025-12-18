import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRadiologyRequestDto } from './dto/create-radiology-request.dto';
import { AddRadiologyItemDto } from './dto/add-radiology-item.dto';
import { SubmitRadiologyResultDto } from './dto/submit-radiology-result.dto';
import { QueryRadiologyRequestsDto } from './dto/query-radiology-requests.dto';

@Injectable()
export class RadiologyRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createRadiologyRequestDto: CreateRadiologyRequestDto) {
    const { visitId, patientId, doctorId, notes } = createRadiologyRequestDto;

    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    return this.prisma.radiologyRequest.create({
      data: {
        visitId,
        patientId,
        doctorId,
        notes,
        status: 'PENDING',
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryRadiologyRequestsDto) {
    const { status, patientId, doctorId } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    return this.prisma.radiologyRequest.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.radiologyRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        visit: true,
        items: {
          include: {
            test: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Radiology request with ID ${id} not found`);
    }

    return request;
  }

  async addItems(id: number, addRadiologyItemDto: AddRadiologyItemDto) {
    const request = await this.findOne(id);

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Can only add items to pending requests');
    }

    const { testIds } = addRadiologyItemDto;

    const items = testIds.map((testId) => ({
      requestId: id,
      testId,
    }));

    await this.prisma.radiologyRequestItem.createMany({
      data: items,
    });

    return this.findOne(id);
  }

  async submitResults(id: number, submitResultDto: SubmitRadiologyResultDto) {
    const request = await this.findOne(id);

    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      throw new BadRequestException('Cannot submit results for this request');
    }

    const { results } = submitResultDto;

    for (const result of results) {
      const item = await this.prisma.radiologyRequestItem.findUnique({
        where: { id: result.itemId },
      });

      if (!item || item.requestId !== id) {
        throw new NotFoundException(`Item with ID ${result.itemId} not found in this request`);
      }

      await this.prisma.radiologyRequestItem.update({
        where: { id: result.itemId },
        data: {
          imageUrl: result.imageUrl,
          report: result.report,
          notes: result.notes,
          resultAt: new Date(),
        },
      });
    }

    const allItems = await this.prisma.radiologyRequestItem.findMany({
      where: { requestId: id },
    });

    const allCompleted = allItems.every((item) => item.resultAt !== null);

    if (allCompleted) {
      await this.prisma.radiologyRequest.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    } else {
      await this.prisma.radiologyRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);

    return this.prisma.radiologyRequest.update({
      where: { id },
      data: { status: status as any },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }
}
