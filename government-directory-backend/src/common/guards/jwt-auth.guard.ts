import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required');
    try { req.user = await this.jwt.verifyAsync(header.slice(7)); return true; }
    catch { throw new UnauthorizedException('Session is invalid or expired. Please log in again.'); }
  }
}
