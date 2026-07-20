import api from './axios';
import type { Doctor, Availability } from '../types';

export const patientDoctorsApi = {
  list: (specialtyId?: number) =>
    api.get<Doctor[]>('/patient/doctors', { params: specialtyId ? { specialty_id: specialtyId } : {} }),

  show: (id: number) => api.get<Doctor>(`/patient/doctors/${id}`),

  availabilities: (doctorId: number) =>
    api.get<Availability[]>(`/patient/doctors/${doctorId}/availabilities`),
};