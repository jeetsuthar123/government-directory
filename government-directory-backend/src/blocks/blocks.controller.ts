import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ResourceService } from '../common/resource.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { validateResourceBody } from '../common/validate-resource-body';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly service: ResourceService) {}
  @Get() list(@Query() query: any, @Req() req: any) { return this.service.list('blocks', query, req.user); }
  @Get(':id') get(@Param('id') id: string, @Req() req: any) { return this.service.get('blocks', id, req.user); }
  @Post() async create(@Body() body: any, @Req() req: any) { return this.service.create('blocks', await validateResourceBody('blocks', body), req.user); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update('blocks', id, await validateResourceBody('blocks', body, true), req.user); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove('blocks', id, req.user); }
}
