import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyTestsService } from './radiology-tests.service';

describe('RadiologyTestsService', () => {
  let service: RadiologyTestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadiologyTestsService],
    }).compile();

    service = module.get<RadiologyTestsService>(RadiologyTestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
