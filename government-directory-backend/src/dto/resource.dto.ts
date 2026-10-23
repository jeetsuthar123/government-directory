import { Type, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { DepartmentDto } from './department.dto';
import { DistrictDto } from './district.dto';
import { BlockDto } from './block.dto';
import { OfficeDto } from './office.dto';
import { DesignationDto } from './designation.dto';
import { EmployeeDto } from './employee.dto';
import { AdminUserDto } from './admin-user.dto';

const DTO_BY_RESOURCE: Record<string, any> = {
  departments: DepartmentDto, districts: DistrictDto, blocks: BlockDto,
  offices: OfficeDto, designations: DesignationDto, employees: EmployeeDto,
  'admin-users': AdminUserDto
};
export async function validateResourceBody(resource: string, body: unknown, partial = false) {
  const Dto = DTO_BY_RESOURCE[resource];
  if (!Dto) throw new BadRequestException('Unknown resource');
  const instance = plainToInstance(Dto, body, { enableImplicitConversion: true });
  const errors = await validate(instance as object, { whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: partial });
  if (errors.length) {
    const messages = errors.flatMap(e => Object.values(e.constraints || {}));
    throw new BadRequestException({ message: 'Validation failed', errors: messages });
  }
  if (partial) {
    // DTO validation permits omitted fields for PATCH; provided fields still must satisfy their validators.
    const provided = body && typeof body === 'object' ? Object.keys(body as object) : [];
    const properties = new Set(Object.keys(instance as object));
    const unknown = provided.filter(k => !properties.has(k));
    if (unknown.length) throw new BadRequestException(`Unknown fields: ${unknown.join(', ')}`);
  }
  return instance;
}