import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET || 'local-only-change-this-secret',
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule]
})
export class AuthModule {}
