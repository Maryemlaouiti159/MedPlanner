import api from './axios';

export interface AdminAppointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  date: string;
  start_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  consultation_type: string;
  reason?: string;
}

export const adminAppointmentsApi = {
  list: (status?: string) => api.get<AdminAppointment[]>('/admin/appointments', { params: status ? { status } : undefined }),
  show: (id: number) => api.get(`/admin/appointments/${id}`),
  update: (id: number, data: { status?: string; reason?: string }) => api.put(`/admin/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/admin/appointments/${id}`),
};
