import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: any) { return { name: req.user.name, email: req.user.email, role: req.user.role, departmentIds: req.user.departmentIds || [] }; }
}
