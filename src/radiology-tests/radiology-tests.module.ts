import { Module } from '@nestjs/common';
import { RadiologyTestsService } from './radiology-tests.service';
import { RadiologyTestsController } from './radiology-tests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RadiologyTestsService],
  controllers: [RadiologyTestsController]
})
export class RadiologyTestsModule {}
