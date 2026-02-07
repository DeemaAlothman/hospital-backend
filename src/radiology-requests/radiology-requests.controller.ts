import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { RadiologyRequestsService } from './radiology-requests.service';
import { CreateRadiologyRequestDto } from './dto/create-radiology-request.dto';
import { AddRadiologyItemDto } from './dto/add-radiology-item.dto';
import { SubmitRadiologyResultDto } from './dto/submit-radiology-result.dto';
import { QueryRadiologyRequestsDto } from './dto/query-radiology-requests.dto';
import { CreateMyRadiologyRequestDto } from './dto/create-my-radiology-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

@Controller('radiology-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RadiologyRequestsController {
  constructor(private readonly radiologyRequestsService: RadiologyRequestsService) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  create(@Body() createRadiologyRequestDto: CreateRadiologyRequestDto) {
    return this.radiologyRequestsService.create(createRadiologyRequestDto);
  }

  @Post('my-request')
  @Roles('DOCTOR')
  createMyRequest(@GetUser() user: any, @Body() dto: CreateMyRadiologyRequestDto) {
    return this.radiologyRequestsService.createMyRadiologyRequest(user.userId, dto);
  }

  @Get('my-requests')
  @Roles('DOCTOR')
  getMyRequests(@GetUser() user: any) {
    return this.radiologyRequestsService.getMyRadiologyRequests(user.userId);
  }

  @Get()
  @Roles('RADIOLOGY_TECH', 'DOCTOR', 'ADMIN')
  findAll(@Query() query: QueryRadiologyRequestsDto) {
    return this.radiologyRequestsService.findAll(query);
  }

  @Get(':id')
  @Roles('RADIOLOGY_TECH', 'DOCTOR', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.radiologyRequestsService.findOne(+id);
  }

  @Post(':id/items')
  @Roles('DOCTOR', 'ADMIN')
  addItems(@Param('id') id: string, @Body() addRadiologyItemDto: AddRadiologyItemDto) {
    return this.radiologyRequestsService.addItems(+id, addRadiologyItemDto);
  }

  @Post(':id/results')
  @Roles('RADIOLOGY_TECH', 'ADMIN')
  submitResults(@Param('id') id: string, @Body() submitResultDto: SubmitRadiologyResultDto) {
    return this.radiologyRequestsService.submitResults(+id, submitResultDto);
  }
}
