import api from './axios';
import type { Secretary, UpdateSecretaryData } from '../types';

export const adminSecretariesApi = {
  list: () => api.get<Secretary[]>('/admin/secretaries'),
  update: (id: number, data: UpdateSecretaryData) => api.put<Secretary>(`/admin/secretaries/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/admin/secretaries/${id}`),
};