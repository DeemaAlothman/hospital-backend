import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyRequestsController } from './radiology-requests.controller';

describe('RadiologyRequestsController', () => {
  let controller: RadiologyRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RadiologyRequestsController],
    }).compile();

    controller = module.get<RadiologyRequestsController>(RadiologyRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
