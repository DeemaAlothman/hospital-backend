import { Module } from '@nestjs/common';
import { RoomReservationsService } from './room-reservations.service';
import { RoomReservationsController } from './room-reservations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomReservationsController],
  providers: [RoomReservationsService],
})
export class RoomReservationsModule {}
