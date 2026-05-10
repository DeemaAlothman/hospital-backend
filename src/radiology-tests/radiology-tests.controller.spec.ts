import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyTestsController } from './radiology-tests.controller';
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

describe('RadiologyTestsController', () => {
  let controller: RadiologyTestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RadiologyTestsController],
      providers: [
        RadiologyTestsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<RadiologyTestsController>(RadiologyTestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
