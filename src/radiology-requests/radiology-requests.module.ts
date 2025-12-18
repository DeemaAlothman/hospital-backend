import { Module } from '@nestjs/common';
import { RadiologyRequestsService } from './radiology-requests.service';
import { RadiologyRequestsController } from './radiology-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RadiologyRequestsService],
  controllers: [RadiologyRequestsController]
})
export class RadiologyRequestsModule {}
