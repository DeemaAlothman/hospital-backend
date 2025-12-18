import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RadiologyTestsService } from './radiology-tests.service';
import { CreateRadiologyTestDto } from './dto/create-radiology-test.dto';
import { UpdateRadiologyTestDto } from './dto/update-radiology-test.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('radiology')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RadiologyTestsController {
  constructor(private readonly radiologyTestsService: RadiologyTestsService) {}

  @Get('tests')
  @Roles('ADMIN', 'RADIOLOGY_TECH', 'DOCTOR', 'CASHIER')
  findAll() {
    return this.radiologyTestsService.findAll();
  }

  @Post('tests')
  @Roles('ADMIN')
  create(@Body() createRadiologyTestDto: CreateRadiologyTestDto) {
    return this.radiologyTestsService.create(createRadiologyTestDto);
  }

  @Get('tests/:id')
  @Roles('ADMIN', 'RADIOLOGY_TECH', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.radiologyTestsService.findOne(+id);
  }

  @Patch('tests/:id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateRadiologyTestDto: UpdateRadiologyTestDto) {
    return this.radiologyTestsService.update(+id, updateRadiologyTestDto);
  }

  @Delete('tests/:id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.radiologyTestsService.remove(+id);
  }
}
