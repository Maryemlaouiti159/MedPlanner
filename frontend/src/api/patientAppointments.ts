import api from './axios';
import type { PatientAppointment, CreateAppointmentData } from '../types';

export interface PaginatedAppointments {
  data: PatientAppointment[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export const patientAppointmentsApi = {
  list: (page = 1) =>
    api.get<PaginatedAppointments>(`/patient/appointments?page=${page}`),

  create: (data: CreateAppointmentData) =>
    api.post('/patient/appointments', data),

  update: (id: number, data: any) =>
    api.put(`/patient/appointments/${id}`, data),

  cancel: (id: number) =>
    api.delete(`/patient/appointments/${id}/cancel`),

  delete: (id: number) =>
    api.delete(`/patient/appointments/${id}`),

  // récupérer les disponibilités d'un médecin
  availabilities: (doctorId: number) =>
    api.get(`/patient/doctors/${doctorId}/availabilities`),

  videoRoom: (id: number) =>
    api.get(`/patient/appointments/${id}/video-room`),
};