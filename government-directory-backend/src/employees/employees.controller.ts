import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ResourceService } from '../common/resource.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { validateResourceBody } from '../common/validate-resource-body';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly service: ResourceService) {}
  @Get() list(@Query() query: any, @Req() req: any) { return this.service.list('employees', query, req.user); }
  @Get(':id') get(@Param('id') id: string, @Req() req: any) { return this.service.get('employees', id, req.user); }
  @Post() async create(@Body() body: any, @Req() req: any) { return this.service.create('employees', await validateResourceBody('employees', body), req.user); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.update('employees', id, await validateResourceBody('employees', body, true), req.user); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove('employees', id, req.user); }
}
