import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LabRequestsService } from './lab-requests.service';
import { LabRequestsController } from './lab-requests.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LabRequestsController],
  providers: [LabRequestsService],
})
export class LabRequestsModule {}
