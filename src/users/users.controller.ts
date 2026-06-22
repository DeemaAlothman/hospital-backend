import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN')
  getStatsByRole() {
    return this.usersService.getStatsByRole();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // ADMIN يعيد تعيين كلمة سر أي موظف بدون الحاجة للقديمة
  @Patch(':id/reset-password')
  @Roles('ADMIN')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(+id, dto);
  }
}
