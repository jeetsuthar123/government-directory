import { Module } from '@nestjs/common';
import { OfficesController } from './offices.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OfficesController],
  providers: [ResourceService]
})
export class OfficesModule {}
