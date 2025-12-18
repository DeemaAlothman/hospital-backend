import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // مهم عشان نستخدمه في Auth
})
export class PrismaModule {}
