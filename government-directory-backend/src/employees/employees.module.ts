import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EmployeesController],
  providers: [ResourceService]
})
export class EmployeesModule {}
