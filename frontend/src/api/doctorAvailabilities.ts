import api from './axios';
import type { Availability, CreateAvailabilityData } from '../types';

export const doctorAvailabilitiesApi = {
  list: () => api.get<Availability[]>('/doctor/availabilities'),

  create: (data: CreateAvailabilityData) =>
    api.post<Availability>('/doctor/availabilities', data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/doctor/availabilities/${id}`),
};