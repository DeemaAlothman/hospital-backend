import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LabTestsService } from './lab-tests.service';
import { LabTestsController } from './lab-tests.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LabTestsController],
  providers: [LabTestsService],
})
export class LabTestsModule {}
