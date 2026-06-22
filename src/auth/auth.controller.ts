import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  // أي مستخدم مسجل يغير كلمة سره — يحتاج كلمة السر الحالية
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@GetUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.userId, dto);
  }
}
