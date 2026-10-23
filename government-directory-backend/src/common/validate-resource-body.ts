import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DepartmentDto } from '../departments/dto/department.dto';
import { DistrictDto } from '../districts/dto/district.dto';
import { BlockDto } from '../blocks/dto/block.dto';
import { OfficeDto } from '../offices/dto/office.dto';
import { DesignationDto } from '../designations/dto/designation.dto';
import { EmployeeDto } from '../employees/dto/employee.dto';
import { AdminUserDto } from '../admin-users/dto/admin-user.dto';

const map: Record<string, any> = {
  departments: DepartmentDto, districts: DistrictDto, blocks: BlockDto, offices: OfficeDto,
  designations: DesignationDto, employees: EmployeeDto, 'admin-users': AdminUserDto
};
export async function validateResourceBody(resource: string, body: unknown, partial = false) {
  const Dto = map[resource];
  if (!Dto) throw new BadRequestException('Unknown resource');
  const instance = plainToInstance(Dto, body, { enableImplicitConversion: true });
  const errors = await validate(instance as object, { whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: partial });
  if (errors.length) throw new BadRequestException({ message: 'Validation failed', errors: errors.flatMap(e => Object.values(e.constraints || {})) });
  return instance;
}
