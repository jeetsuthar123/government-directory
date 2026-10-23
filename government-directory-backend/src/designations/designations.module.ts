import { Module } from '@nestjs/common';
import { DesignationsController } from './designations.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DesignationsController],
  providers: [ResourceService]
})
export class DesignationsModule {}
