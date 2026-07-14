import api from './axios';
import type { User, PaginatedResponse, UserFilters, UserRole, CreateUserData } from '../types';

export const adminUsersApi = {
  list: (filters: UserFilters) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params: filters }),

  show: (id: number) => api.get<User>(`/admin/users/${id}`),

  create: (data: CreateUserData) =>
    api.post<{ message: string; user: User }>('/admin/users', data),

  update: (id: number, data: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone'>>) =>
    api.put<User>(`/admin/users/${id}`, data),

  // restreint à patient <-> admin côté UI (le back accepte plus large,
  // mais changer vers doctor/secretary sans profil casserait l'appli)
  changeRole: (id: number, role: Extract<UserRole, 'patient' | 'admin'>) =>
    api.patch<User>(`/admin/users/${id}/role`, { role }),

  toggleStatus: (id: number) =>
    api.patch<User>(`/admin/users/${id}/toggle-status`),

  remove: (id: number) => api.delete<{ message: string }>(`/admin/users/${id}`),
};