import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

export interface Officer {
  id: string;
  _id?: string;
  name: string;
  fullName?: string;
  designation: string;
  office: string;
  department: string;
  district: string;
  phone: string;
  mobile?: string;
  email: string;
  dob: string;
  dateOfBirth?: string;
  retirement: string;
  dateOfRetirement?: string;
  seniority: string;
  employeeCode?: string;
  isActive: boolean;
  status?: string;
  [key: string]: unknown;
}
export interface ReferenceItem {
  id?: string;
  _id?: string;
  name: string;
  [key: string]: unknown;
}
export interface DashboardSummary {
  totalEmployees?: number;
  employees?: number;
  totalActiveEmployees?: number;
  totalDepartments?: number;
  departments?: number;
  totalOffices?: number;
  offices?: number;
  totalDistricts?: number;
  districts?: number;
  [key: string]: unknown;
}
export type DirectoryScreenName =
  | "Dashboard"
  | "Directory"
  | "Details"
  | "Birthdays"
  | "Retirement"
  | "Alumni"
  | "Calendar";
export type EventScreenName =
  | "Birthdays"
  | "Retirement"
  | "Alumni"
  | "Calendar";
export interface NavigationItem {
  key: DirectoryScreenName;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}
export interface SharedScreenProps {
  employees: Officer[];
  departments: ReferenceItem[];
  designations: ReferenceItem[];
  districts: ReferenceItem[];
  summary: DashboardSummary | null;
  loading: boolean;
  message: string;
  onRetry: () => void | Promise<unknown>;
  onOpenOfficer: (officer: Officer, from?: DirectoryScreenName) => void;
  onNavigate: (screen: DirectoryScreenName) => void;
}
