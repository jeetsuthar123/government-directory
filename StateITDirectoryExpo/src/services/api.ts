import { Platform } from "react-native";
import type { DashboardSummary, Officer, ReferenceItem } from "../types/models";

export interface PublicEmployeeQuery {
  search?: string;
  departmentId?: string;
  districtId?: string;
  blockId?: string;
  officeId?: string;
  designationId?: string;
  status?: "active" | "inactive";
  letter?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt";
  order?: "asc" | "desc";
}
export interface PublicDirectoryPage {
  data: Officer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
type JsonRecord = Record<string, unknown>;
const DEFAULT_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000/api/v1"
    : "http://localhost:3000/api/v1";
export const API_BASE_URL: string = String(
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL,
).replace(/\/$/, "");

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}
function asString(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}
function unwrapPayload(payload: unknown): unknown {
  return isRecord(payload) && payload.data !== undefined
    ? payload.data
    : payload;
}
function extractRows(payload: unknown): JsonRecord[] {
  const value = unwrapPayload(payload);
  if (Array.isArray(value)) return value.filter(isRecord);
  const record = asRecord(value);
  for (const key of ["data", "items", "results"])
    if (Array.isArray(record[key]))
      return (record[key] as unknown[]).filter(isRecord);
  return [];
}
function nestedRecord(value: unknown): JsonRecord | null {
  return isRecord(value) ? value : null;
}
function formatDate(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  return !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-GB")
    : String(value);
}
function normalizeOfficer(item: JsonRecord, index: number): Officer {
  const office = nestedRecord(item.officeId) ?? nestedRecord(item.office);
  const designation =
    nestedRecord(item.designationId) ?? nestedRecord(item.designation);
  const department =
    nestedRecord(office?.departmentId) ??
    nestedRecord(item.departmentId) ??
    nestedRecord(item.department);
  const district =
    nestedRecord(office?.districtId) ??
    nestedRecord(item.districtId) ??
    nestedRecord(item.district);
  const dobValue = item.dateOfBirth ?? item.dob;
  const retirementValue =
    item.dateOfRetirement ?? item.retirementDate ?? item.retirement;
  return {
    id: asString(
      item._id ?? item.id ?? item.employeeCode ?? item.name,
      `officer-${index}`,
    ),
    _id: asString(item._id ?? item.id),
    name: asString(item.name ?? item.fullName, "Unnamed officer"),
    designation: asString(
      designation?.name ?? item.designation,
      "Designation not specified",
    ),
    office: asString(office?.name ?? item.office, "Office not specified"),
    department: asString(department?.name ?? item.department),
    district: asString(district?.name ?? item.district),
    phone: asString(item.mobile ?? item.phone ?? item.contactNumber),
    email: asString(item.email),
    dob: formatDate(dobValue),
    dateOfBirth: asString(dobValue),
    retirement: formatDate(retirementValue),
    dateOfRetirement: asString(retirementValue),
    seniority: asString(item.seniority),
    isActive: item.isActive !== false && item.status !== "inactive",
  };
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...((options.headers || {}) as Record<string, string>),
  };
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
      { ...options, headers },
    );
  } catch {
    throw new Error(
      `Cannot reach the public directory API at ${API_BASE_URL}. Check the app .env URL, backend listener, device network, and firewall.`,
    );
  }
  const raw = await response.text();
  let payload: unknown = null;
  try {
    payload = raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    payload = raw;
  }
  if (!response.ok) {
    const record = asRecord(payload);
    const message = record.message ?? record.error;
    const readable = Array.isArray(message) ? message.join(", ") : message;
    throw new Error(
      typeof readable === "string"
        ? readable
        : `API request failed (${response.status})`,
    );
  }
  return payload;
}

function queryString(params: PublicEmployeeQuery): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      search.set(key, String(value));
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export async function fetchPublicEmployees(
  params: PublicEmployeeQuery = {},
): Promise<PublicDirectoryPage> {
  const payload = await apiRequest(
    `/public/directory/employees${queryString({ page: 1, limit: 25, sortBy: "name", order: "asc", ...params })}`,
  );
  const outer = asRecord(payload);
  const rows = extractRows(payload);
  const page = Number(outer.page) || params.page || 1;
  const limit = Number(outer.limit) || params.limit || rows.length || 25;
  return {
    data: rows.map(normalizeOfficer),
    total: Number(outer.total) || 0,
    page,
    limit,
    totalPages: Number(outer.totalPages) || 0,
  };
}

export async function fetchPublicEmployee(id: string): Promise<Officer> {
  const payload = await apiRequest(
    `/public/directory/employees/${encodeURIComponent(id)}`,
  );
  const record = asRecord(unwrapPayload(payload));
  return normalizeOfficer(record, 0);
}

export async function fetchAllEmployees(): Promise<Officer[]> {
  const page = await fetchPublicEmployees({
    page: 1,
    limit: 100,
    sortBy: "name",
    order: "asc",
  });
  return page.data;
}

export async function fetchPublicSummary(): Promise<DashboardSummary> {
  return asRecord(
    unwrapPayload(await apiRequest("/public/directory/summary")),
  ) as DashboardSummary;
}

export async function fetchReference(
  resource: "departments" | "designations" | "districts",
): Promise<ReferenceItem[]> {
  return extractRows(await apiRequest(`/public/directory/${resource}`)).map(
    (item) => ({
      id: asString(item.id ?? item._id),
      _id: asString(item._id ?? item.id),
      name: asString(item.name),
    }),
  );
}
