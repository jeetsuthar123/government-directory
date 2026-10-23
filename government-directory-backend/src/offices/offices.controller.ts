import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ResourceService } from '../common/resource.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { validateResourceBody } from '../common/validate-resource-body';

@Controller('offices')
@UseGuards(JwtAuthGuard)
export class OfficesController {
  constructor(private readonly service: ResourceService) {}
  @Get() list(@Query() query: any, @Req() req: any) { return this.service.list('offices', query, req.user); }
  @Get(':id') get(@Param('id') id: string, @Req() req: any) { return this.service.get('offices', id, req.user); }
  @Post() async create(@Body() body: any, @Req() req: any) { return this.service.create('offices', await validateResourceBody('offices', body), req.user); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update('offices', id, await validateResourceBody('offices', body, true), req.user); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove('offices', id, req.user); }
}
