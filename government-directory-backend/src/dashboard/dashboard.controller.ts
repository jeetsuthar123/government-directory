import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SCHEMA_MAP } from '../schemas';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  @Get('summary')
  async summary() {
    const counts: Record<string, number> = {};
    for (const [resource, spec] of Object.entries(SCHEMA_MAP)) {
      if (resource === 'admin-users') continue;
      const model = this.connection.models[spec.modelName] || this.connection.model(spec.modelName, spec.schema, spec.collectionName);
      counts[resource] = await model.countDocuments();
    }
    return counts;
  }
}
