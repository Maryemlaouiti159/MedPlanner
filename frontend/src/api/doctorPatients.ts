import api from './axios';
import type { DoctorPatient } from './doctorDashboard';

export const doctorPatientsApi = {
  list: async () => {
    const res = await api.get<DoctorPatient[]>('/doctor/patients');
    return res;
  },
};