import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { RadiologyRequestsService } from './radiology-requests.service';
import { CreateRadiologyRequestDto } from './dto/create-radiology-request.dto';
import { AddRadiologyItemDto } from './dto/add-radiology-item.dto';
import { SubmitRadiologyResultDto } from './dto/submit-radiology-result.dto';
import { QueryRadiologyRequestsDto } from './dto/query-radiology-requests.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('radiology')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RadiologyRequestsController {
  constructor(private readonly radiologyRequestsService: RadiologyRequestsService) {}

  @Post('requests')
  @Roles('DOCTOR', 'ADMIN')
  create(@Body() createRadiologyRequestDto: CreateRadiologyRequestDto) {
    return this.radiologyRequestsService.create(createRadiologyRequestDto);
  }

  @Get('requests')
  @Roles('RADIOLOGY_TECH', 'DOCTOR', 'ADMIN')
  findAll(@Query() query: QueryRadiologyRequestsDto) {
    return this.radiologyRequestsService.findAll(query);
  }

  @Get('requests/:id')
  @Roles('RADIOLOGY_TECH', 'DOCTOR', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.radiologyRequestsService.findOne(+id);
  }

  @Post('requests/:id/items')
  @Roles('DOCTOR', 'ADMIN')
  addItems(@Param('id') id: string, @Body() addRadiologyItemDto: AddRadiologyItemDto) {
    return this.radiologyRequestsService.addItems(+id, addRadiologyItemDto);
  }

  @Post('requests/:id/results')
  @Roles('RADIOLOGY_TECH', 'ADMIN')
  submitResults(@Param('id') id: string, @Body() submitResultDto: SubmitRadiologyResultDto) {
    return this.radiologyRequestsService.submitResults(+id, submitResultDto);
  }
}
