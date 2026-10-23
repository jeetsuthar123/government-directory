import { Schema, Types } from 'mongoose';
import { DepartmentSchema } from './schemas/department.schema';
import { DistrictSchema } from './schemas/district.schema';
import { BlockSchema } from './schemas/block.schema';
import { OfficeSchema } from './schemas/office.schema';
import { DesignationSchema } from './schemas/designation.schema';
import { EmployeeSchema } from './schemas/employee.schema';
import { AdminUserSchema } from './schemas/admin-user.schema';

export { DepartmentSchema, DistrictSchema, BlockSchema, OfficeSchema, DesignationSchema, EmployeeSchema, AdminUserSchema };
export const SCHEMA_MAP: Record<string, { modelName: string; collectionName: string; schema: Schema }> = {
  departments: { modelName: 'Department', collectionName: 'departments', schema: DepartmentSchema },
  districts: { modelName: 'District', collectionName: 'districts', schema: DistrictSchema },
  blocks: { modelName: 'Block', collectionName: 'blocks', schema: BlockSchema },
  offices: { modelName: 'Office', collectionName: 'offices', schema: OfficeSchema },
  designations: { modelName: 'Designation', collectionName: 'designations', schema: DesignationSchema },
  employees: { modelName: 'Employee', collectionName: 'employees', schema: EmployeeSchema },
  'admin-users': { modelName: 'AdminUser', collectionName: 'adminUsers', schema: AdminUserSchema }
};
export const isObjectId = (value: unknown) => typeof value === 'string' && Types.ObjectId.isValid(value);
