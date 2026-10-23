import type { ResourceConfig, ResourceKey } from '../types';

export const resourceConfigs: ResourceConfig[] = [
  {
    key: 'departments', label: 'Departments', singular: 'Department', icon: 'building-2',
    description: 'Manage departments that own government offices.',
    superAdminOnly: true,
    fields: [
      { name: 'name', label: 'Department name', kind: 'text', required: true, maxLength: 150 },
      { name: 'code', label: 'Department code', kind: 'text', required: true, maxLength: 30, help: 'Must be unique.' },
      { name: 'shortName', label: 'Short name', kind: 'text', maxLength: 80 },
      { name: 'description', label: 'Description', kind: 'textarea', maxLength: 1000 },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'Department' }, { key: 'code', label: 'Code' }, { key: 'shortName', label: 'Short name' }, { key: 'isActive', label: 'Status' }]
  },
  {
    key: 'districts', label: 'Districts', singular: 'District', icon: 'map-pinned',
    description: 'Manage districts and their state information.', superAdminOnly: true,
    fields: [
      { name: 'name', label: 'District name', kind: 'text', required: true, maxLength: 150 },
      { name: 'code', label: 'District code', kind: 'text', maxLength: 30 },
      { name: 'state', label: 'State', kind: 'text', maxLength: 100 },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'District' }, { key: 'code', label: 'Code' }, { key: 'state', label: 'State' }, { key: 'isActive', label: 'Status' }]
  },
  {
    key: 'blocks', label: 'Blocks', singular: 'Block', icon: 'map',
    description: 'Manage blocks and their parent districts.', superAdminOnly: true,
    fields: [
      { name: 'districtId', label: 'District', kind: 'select', required: true, optionsResource: 'districts' },
      { name: 'name', label: 'Block name', kind: 'text', required: true, maxLength: 150 },
      { name: 'code', label: 'Block code', kind: 'text', maxLength: 30 },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'Block' }, { key: 'districtId', label: 'District' }, { key: 'code', label: 'Code' }, { key: 'isActive', label: 'Status' }]
  },
  {
    key: 'offices', label: 'Offices', singular: 'Office', icon: 'landmark',
    description: 'Manage offices, locations and department assignments.',
    fields: [
      { name: 'departmentId', label: 'Department', kind: 'select', required: true, optionsResource: 'departments' },
      { name: 'name', label: 'Office name', kind: 'text', required: true, maxLength: 150 },
      { name: 'code', label: 'Office code', kind: 'text', maxLength: 30 },
      { name: 'districtId', label: 'District', kind: 'select', required: true, optionsResource: 'districts' },
      { name: 'blockId', label: 'Block (optional)', kind: 'select', optionsResource: 'blocks' },
      { name: 'address', label: 'Address', kind: 'textarea', maxLength: 500 },
      { name: 'phone', label: 'Phone', kind: 'tel', maxLength: 30 },
      { name: 'email', label: 'Email', kind: 'email', maxLength: 254 },
      { name: 'latitude', label: 'Latitude', kind: 'number', min: -90, max: 90 },
      { name: 'longitude', label: 'Longitude', kind: 'number', min: -180, max: 180 },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'Office' }, { key: 'departmentId', label: 'Department' }, { key: 'districtId', label: 'District' }, { key: 'code', label: 'Code' }, { key: 'isActive', label: 'Status' }]
  },
  {
    key: 'designations', label: 'Designations', singular: 'Designation', icon: 'badge-check',
    description: 'Manage official designations and hierarchy levels.', superAdminOnly: true,
    fields: [
      { name: 'name', label: 'Designation name', kind: 'text', required: true, maxLength: 150 },
      { name: 'code', label: 'Designation code', kind: 'text', maxLength: 30 },
      { name: 'level', label: 'Level', kind: 'number', min: 0, max: 100 },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'Designation' }, { key: 'code', label: 'Code' }, { key: 'level', label: 'Level' }, { key: 'isActive', label: 'Status' }]
  },
  {
    key: 'employees', label: 'Employees', singular: 'Employee', icon: 'users',
    description: 'Manage employee directory profiles and public visibility.',
    fields: [
      { name: 'officeId', label: 'Office', kind: 'select', required: true, optionsResource: 'offices' },
      { name: 'designationId', label: 'Designation', kind: 'select', required: true, optionsResource: 'designations' },
      { name: 'name', label: 'Employee name', kind: 'text', required: true, maxLength: 150 },
      { name: 'employeeCode', label: 'Employee code', kind: 'text', maxLength: 40 },
      { name: 'mobile', label: 'Mobile number', kind: 'tel', maxLength: 30 },
      { name: 'email', label: 'Email', kind: 'email', maxLength: 254 },
      { name: 'dateOfBirth', label: 'Date of birth', kind: 'date' },
      { name: 'isPublic', label: 'Visible in public directory', kind: 'boolean' },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'Employee' }, { key: 'employeeCode', label: 'Employee code' }, { key: 'officeId', label: 'Office' }, { key: 'designationId', label: 'Designation' }, { key: 'dateOfBirth', label: 'Date of birth' }, { key: 'isActive', label: 'Status' }]
  },
  {
    key: 'admin-users', label: 'Admin Users', singular: 'Admin User', icon: 'shield-check',
    description: 'Manage administrator access and department assignments.',
    superAdminOnly: true,
    fields: [
      { name: 'name', label: 'Full name', kind: 'text', required: true, maxLength: 150 },
      { name: 'email', label: 'Email', kind: 'email', required: true },
      { name: 'password', label: 'Initial password', kind: 'password', required: false, maxLength: 100, help: 'At least 8 characters. When editing, leave blank to keep the current password.' },
      { name: 'role', label: 'Role', kind: 'select', required: true, optionsResource: undefined, help: 'Choose an administrator role.' },
      { name: 'departmentIds', label: 'Assigned departments', kind: 'multiselect', optionsResource: 'departments' },
      { name: 'isActive', label: 'Active', kind: 'boolean' }
    ],
    columns: [{ key: 'name', label: 'Administrator' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'isActive', label: 'Status' }]
  }
];

export const resourceByKey = (key: ResourceKey) => resourceConfigs.find(config => config.key === key)!;