import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyRequestsService } from './radiology-requests.service';

describe('RadiologyRequestsService', () => {
  let service: RadiologyRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadiologyRequestsService],
    }).compile();

    service = module.get<RadiologyRequestsService>(RadiologyRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
