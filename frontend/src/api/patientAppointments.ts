import api from './axios';
import type { PatientAppointment, CreateAppointmentData } from '../types';

export const patientAppointmentsApi = {
  list: () => api.get<PatientAppointment[]>('/patient/appointments'),
  create: (data: CreateAppointmentData) => api.post<PatientAppointment>('/patient/appointments', data),
  cancel: (id: number) => api.delete<{ message: string }>(`/patient/appointments/${id}`),
};