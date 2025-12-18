import { Test, TestingModule } from '@nestjs/testing';
import { RadiologyTestsController } from './radiology-tests.controller';

describe('RadiologyTestsController', () => {
  let controller: RadiologyTestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RadiologyTestsController],
    }).compile();

    controller = module.get<RadiologyTestsController>(RadiologyTestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
