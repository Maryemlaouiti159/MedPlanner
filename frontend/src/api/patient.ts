import api from './axios';
import type { PatientDoctor, Availability, Appointment, CreateAppointmentData } from '../types';

export const patientApi = {
  doctors: (specialtyId?: number) =>
    api.get<PatientDoctor[]>('/patient/doctors', { params: specialtyId ? { specialty_id: specialtyId } : {} }),

  doctorShow: (id: number) => api.get<PatientDoctor>(`/patient/doctors/${id}`),

  doctorAvailabilities: (id: number) =>
    api.get<Availability[]>(`/patient/doctors/${id}/availabilities`),

  appointments: () => api.get<Appointment[]>('/patient/appointments'),

  book: (data: CreateAppointmentData) =>
    api.post<Appointment>('/patient/appointments', data),

  cancel: (id: number) => api.delete<{ message: string }>(`/patient/appointments/${id}`),
};