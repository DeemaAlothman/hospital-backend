import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyTestsService } from './radiology-tests.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  radiologyTest: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RadiologyTestsService', () => {
  let service: RadiologyTestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RadiologyTestsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RadiologyTestsService>(RadiologyTestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
