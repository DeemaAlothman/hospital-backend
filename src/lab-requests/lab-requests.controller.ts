import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LabRequestsService } from './lab-requests.service';
import { CreateLabRequestDto } from './dto/create-lab-request.dto';
import { UpdateLabRequestDto } from './dto/update-lab-request.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';
import { QueryLabRequestsDto } from './dto/query-lab-requests.dto';

import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('lab/requests')
export class LabRequestsController {
  constructor(private readonly service: LabRequestsService) {}

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  @Post()
  create(@Body() dto: CreateLabRequestDto) {
    return this.service.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  @Get()
  findAll(@Query() query: QueryLabRequestsDto) {
    return this.service.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Roles(UserRole.ADMIN, UserRole.LAB_TECH)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLabRequestDto) {
    return this.service.update(+id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.LAB_TECH)
  @Patch(':requestId/items/:itemId')
  updateResult(
    @Param('requestId') requestId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateLabResultDto,
  ) {
    return this.service.updateResult(+requestId, +itemId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
