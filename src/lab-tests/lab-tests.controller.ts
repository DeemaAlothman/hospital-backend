
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LabTestsService } from './lab-tests.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('lab/tests')
export class LabTestsController {
  constructor(private readonly service: LabTestsService) {}

  // إنشاء تحليل: ADMIN + LAB_TECH
  @Roles(UserRole.ADMIN, UserRole.LAB_TECH)
  @Post()
  create(@Body() dto: CreateLabTestDto) {
    return this.service.create(dto);
  }

  // قراءة كل التحاليل
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // قراءة تحليل واحد
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // تعديل تحليل: ADMIN + LAB_TECH
  @Roles(UserRole.ADMIN, UserRole.LAB_TECH)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLabTestDto) {
    return this.service.update(+id, dto);
  }

  // حذف تحليل: ADMIN + LAB_TECH
  @Roles(UserRole.ADMIN, UserRole.LAB_TECH)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
