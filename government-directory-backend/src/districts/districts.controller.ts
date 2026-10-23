import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ResourceService } from '../common/resource.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { validateResourceBody } from '../common/validate-resource-body';

@Controller('districts')
@UseGuards(JwtAuthGuard)
export class DistrictsController {
  constructor(private readonly service: ResourceService) {}
  @Get() list(@Query() query: any, @Req() req: any) { return this.service.list('districts', query, req.user); }
  @Get(':id') get(@Param('id') id: string, @Req() req: any) { return this.service.get('districts', id, req.user); }
  @Post() async create(@Body() body: any, @Req() req: any) { return this.service.create('districts', await validateResourceBody('districts', body), req.user); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update('districts', id, await validateResourceBody('districts', body, true), req.user); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove('districts', id, req.user); }
}
