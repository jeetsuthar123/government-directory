import { Module } from '@nestjs/common';
import { AdminUsersController } from './adminusers.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController],
  providers: [ResourceService]
})
export class AdminUsersModule {}
