import {
  Body,
  Controller,
  Delete,
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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomsDto } from './dto/query-rooms.dto';
import { CreateBedDto } from './dto/create-bed.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE, UserRole.DOCTOR)
  @Get()
  findAll(@Query() query: QueryRoomsDto) {
    return this.roomsService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE, UserRole.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/beds')
  addBed(@Param('id') id: string, @Body() dto: CreateBedDto) {
    return this.roomsService.addBed(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/maintenance')
  toggleMaintenance(@Param('id') id: string) {
    return this.roomsService.toggleMaintenance(+id);
  }
}
