import { Test, TestingModule } from '@nestjs/testing';
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

describe('RadiologyRequestsService', () => {
  let service: RadiologyRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RadiologyRequestsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RadiologyRequestsService>(RadiologyRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
