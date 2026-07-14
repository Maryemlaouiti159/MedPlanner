import api from './axios';
import type { Specialty } from '../types';

export const specialtiesApi = {
  list: () => api.get<Specialty[]>('/admin/specialties'),
  create: (data: { name: string; description?: string }) =>
    api.post<Specialty>('/admin/specialties', data),
  update: (id: number, data: { name?: string; description?: string }) =>
    api.put<Specialty>(`/admin/specialties/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/admin/specialties/${id}`),
};