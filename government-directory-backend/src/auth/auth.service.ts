import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUserSchema } from '../schemas/admin-user.schema';

@Injectable()
export class AuthService {
  private users: any;
  constructor(@InjectConnection() connection: Connection, private readonly jwt: JwtService) {
    this.users = connection.models.AdminUser || connection.model('AdminUser', AdminUserSchema, 'adminUsers');
  }
  async login(email: string, password: string) {
    const user: any = await this.users.findOne({ email: email.toLowerCase(), isActive: true }).select('+passwordHash').lean();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    const departmentIds = (user.departmentIds || []).map((x: any) => String(x));
    const payload = { sub: String(user._id), email: user.email, name: user.name, role: user.role, departmentIds };
    return { accessToken: await this.jwt.signAsync(payload), user: { name: user.name, email: user.email, role: user.role, departmentIds } };
  }
}
