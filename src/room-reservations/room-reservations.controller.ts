import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoomReservationsService } from './room-reservations.service';
import { CreateRoomReservationDto } from './dto/create-room-reservation.dto';
import { UpdateRoomReservationDto } from './dto/update-room-reservation.dto';
import { QueryRoomReservationsDto } from './dto/query-room-reservations.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('room-reservations')
export class RoomReservationsController {
  constructor(private readonly service: RoomReservationsService) {}

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE)
  @Post()
  create(@Body() dto: CreateRoomReservationDto) {
    return this.service.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE, UserRole.DOCTOR)
  @Get()
  findAll(@Query() query: QueryRoomReservationsDto) {
    return this.service.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE, UserRole.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Roles(UserRole.ADMIN, UserRole.NURSE)
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(+id);
  }

  @Roles(UserRole.ADMIN, UserRole.NURSE, UserRole.RECEPTIONIST)
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.service.complete(+id);
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(+id);
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomReservationDto) {
    return this.service.update(+id, dto);
  }
}
