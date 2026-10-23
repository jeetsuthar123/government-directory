import { Module } from '@nestjs/common';
import { BlocksController } from './blocks.controller';
import { ResourceService } from '../common/resource.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BlocksController],
  providers: [ResourceService]
})
export class BlocksModule {}
