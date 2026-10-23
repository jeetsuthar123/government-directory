export type UserRole = 'super_admin' | 'department_admin';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  departmentIds: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DirectoryRecord {
  _id: string;
  name?: string;
  code?: string;
  shortName?: string;
  description?: string;
  state?: string;
  districtId?: string | DirectoryRecord;
  departmentId?: string | DirectoryRecord;
  blockId?: string | DirectoryRecord | null;
  officeId?: string | DirectoryRecord;
  designationId?: string | DirectoryRecord;
  employeeCode?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string;
  isPublic?: boolean;
  isActive?: boolean;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  level?: number;
  role?: UserRole;
  departmentIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface DashboardSummary {
  departments: number;
  districts: number;
  blocks: number;
  offices: number;
  designations: number;
  employees: number;
}

export type FieldKind = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'boolean' | 'select' | 'password' | 'multiselect';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  optionsResource?: ResourceKey;
  optionsLabel?: string;
  help?: string;
}

export type ResourceKey =
  | 'departments'
  | 'districts'
  | 'blocks'
  | 'offices'
  | 'designations'
  | 'employees'
  | 'admin-users';

export interface ResourceConfig {
  key: ResourceKey;
  label: string;
  singular: string;
  description: string;
  fields: FieldConfig[];
  columns: { key: string; label: string }[];
  icon: string;
  superAdminOnly?: boolean;
}