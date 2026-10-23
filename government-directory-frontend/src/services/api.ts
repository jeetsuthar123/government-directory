import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  ApiListResponse, DashboardSummary, DirectoryRecord, LoginResponse,
  ResourceKey, UserProfile
} from '../types';

const TOKEN_KEY = 'god_access_token';
const USER_KEY = 'god_user';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
  getUser: (): UserProfile | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as UserProfile; } catch { return null; }
  },
  setUser: (user: UserProfile) => localStorage.setItem(USER_KEY, JSON.stringify(user))
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError<{ message?: string | string[]; errors?: string[] }>) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (window.location.pathname !== '/login') window.location.assign('/login?expired=1');
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string | string[]; errors?: string[] } | undefined;
    if (Array.isArray(payload?.message)) return payload.message.join(', ');
    if (typeof payload?.message === 'string') return payload.message;
    if (payload?.errors?.length) return payload.errors.join(', ');
    if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
    if (!error.response) return 'Cannot reach the backend. Check that the API is running and the URL is correct.';
    return `Request failed (${error.response.status}). Please try again.`;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export const authApi = {
  login: async (email: string, password: string) =>
    (await api.post<LoginResponse>('/auth/login', { email, password })).data,
  profile: async () => (await api.get<UserProfile>('/auth/profile')).data
};

export const dashboardApi = {
  summary: async () => (await api.get<DashboardSummary>('/dashboard/summary')).data
};

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

export const resourceApi = {
  list: async (resource: ResourceKey, params: ListParams = {}) =>
    (await api.get<ApiListResponse<DirectoryRecord>>(`/${resource}`, { params })).data,
  get: async (resource: ResourceKey, id: string) =>
    (await api.get<DirectoryRecord>(`/${resource}/${id}`)).data,
  create: async (resource: ResourceKey, body: Record<string, unknown>) =>
    (await api.post<DirectoryRecord>(`/${resource}`, body)).data,
  update: async (resource: ResourceKey, id: string, body: Record<string, unknown>) =>
    (await api.patch<DirectoryRecord>(`/${resource}/${id}`, body)).data,
  remove: async (resource: ResourceKey, id: string) =>
    (await api.delete(`/${resource}/${id}`)).data
};

export default api;