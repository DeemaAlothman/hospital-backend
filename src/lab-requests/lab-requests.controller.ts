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
import { LabRequestsService } from './lab-requests.service';
import { CreateLabRequestDto } from './dto/create-lab-request.dto';
import { UpdateLabRequestDto } from './dto/update-lab-request.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';
import { QueryLabRequestsDto } from './dto/query-lab-requests.dto';
import { CreateMyLabRequestDto } from './dto/create-my-lab-request.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lab-requests')
export class LabRequestsController {
  constructor(private readonly service: LabRequestsService) {}

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  @Post()
  create(@Body() dto: CreateLabRequestDto) {
    return this.service.create(dto);
  }

  @Roles(UserRole.DOCTOR)
  @Post('my-request')
  createMyRequest(@GetUser() user: any, @Body() dto: CreateMyLabRequestDto) {
    return this.service.createMyLabRequest(user.userId, dto);
  }

  @Roles(UserRole.DOCTOR)
  @Get('my-requests')
  getMyRequests(@GetUser() user: any) {
    return this.service.getMyLabRequests(user.userId);
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
