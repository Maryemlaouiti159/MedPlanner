import api from './axios';
import type { Doctor, CreateDoctorData, UpdateDoctorData } from '../types';

export const adminDoctorsApi = {
  list: () => api.get<Doctor[]>('/admin/doctors'),
  show: (id: number) => api.get<Doctor>(`/admin/doctors/${id}`),
  create: (data: CreateDoctorData) => api.post<Doctor>('/admin/doctors', data),
  update: (id: number, data: UpdateDoctorData) => api.put<Doctor>(`/admin/doctors/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/admin/doctors/${id}`),
};