import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  // إنشاء دواء: ADMIN + PHARMACIST
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  @Post()
  create(@Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(dto);
  }

  // قراءة الأدوية: كل الطاقم الطبي
  @Roles(
    UserRole.ADMIN,
    UserRole.PHARMACIST,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  )
  @Get()
  findAll(@Query('q') q?: string) {
    return this.medicinesService.findAll(q);
  }

  @Roles(
    UserRole.ADMIN,
    UserRole.PHARMACIST,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(+id);
  }

  // تعديل: ADMIN + PHARMACIST
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    return this.medicinesService.update(+id, dto);
  }

  // حذف: ADMIN + PHARMACIST
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(+id);
  }
}
