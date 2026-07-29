import api from './axios';

export interface DoctorDashboardData {
  doctor: any;
  today_appointments: any[];
  pending_appointments: any[];
  week_counts: { day: string; count: number }[];
  stats: {
    today_patients: number;
    pending_count: number;
    total_patients: number;
    avg_rating: number;
  };
}

export interface DoctorPatient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_consultations: number;
  last_visit: string | null;
  next_visit: string | null;
  conditions: string[];
}

export const doctorDashboardApi = {
  getDashboard: async () => {
    const response = await api.get<DoctorDashboardData>('/doctor/dashboard');
    return response;
  },
  acceptAppointment: async (appointmentId: number) => {
    const response = await api.patch(`/doctor/appointments/${appointmentId}/accept`);
    return response;
  },
  rejectAppointment: async (appointmentId: number) => {
    const response = await api.patch(`/doctor/appointments/${appointmentId}/reject`);
    return response;
  },
  getPatients: async () => {
    const response = await api.get<DoctorPatient[]>('/doctor/patients');
    return response;
  },
  deletePatient: (patientId: number) =>
  api.delete(`/doctor/patients/${patientId}`),
  getPatientDetail: (patientId: number) =>
  api.get(`/doctor/patients/${patientId}`),
};
