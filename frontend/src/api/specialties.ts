import api from './axios';
import type { Specialty } from '../types';

export interface SpecialtyWithCounts {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  doctors_count: number;
  slots_count: number;
}

export const specialtiesApi = {
  list: () => api.get<Specialty[]>('/patient/specialties'),
  listAdmin: () => api.get<SpecialtyWithCounts[]>('/admin/specialties'),

  create: (data: { name: string; description?: string; icon?: string }) =>
    api.post<Specialty>('/admin/specialties', data),

  update: (id: number, data: { name?: string; description?: string; icon?: string }) =>
    api.put<Specialty>(`/admin/specialties/${id}`, data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/admin/specialties/${id}`),
};