import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyRequestsController } from './radiology-requests.controller';
import { RadiologyRequestsService } from './radiology-requests.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  radiologyRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  radiologyRequestItem: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('RadiologyRequestsController', () => {
  let controller: RadiologyRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RadiologyRequestsController],
      providers: [
        RadiologyRequestsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<RadiologyRequestsController>(RadiologyRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
