import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DepartmentsController],
  providers: [ResourceService]
})
export class DepartmentsModule {}
