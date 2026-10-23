import { Module } from '@nestjs/common';
import { DistrictsController } from './districts.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DistrictsController],
  providers: [ResourceService]
})
export class DistrictsModule {}
