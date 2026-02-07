import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')


export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // إنشاء مريض: ADMIN + RECEPTIONIST + NURSE
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE)
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  // قراءة كل المرضى: ADMIN + RECEPTIONIST + DOCTOR + NURSE
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  // قراءة مريض واحد
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(+id);
  }

  // تعديل مريض: ADMIN + RECEPTIONIST + NURSE
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(+id, updatePatientDto);
  }

  // حذف مريض: ADMIN + RECEPTIONIST + NURSE
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(+id);
  }
}
