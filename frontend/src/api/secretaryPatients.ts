import api from './axios';

export interface SecretaryPatient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  total_consultations: number;
  last_visit: string | null;
  next_visit: string | null;
  conditions: string[];
}

export const secretaryPatientsApi = {
  listMine() {
    return api.get<SecretaryPatient[]>('/secretary/patients/mine');
  },
};