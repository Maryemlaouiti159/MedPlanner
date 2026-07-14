export interface MockAppointment {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending';
  color: string;
}

export const MOCK_UPCOMING_APPOINTMENTS: MockAppointment[] = [
  { id: 1, doctorName: 'Dr. Amina Benali', specialty: 'Cardiologie', date: '14 Juil 2026', time: '09:30', status: 'confirmed', color: '#1e3a5f' },
  { id: 2, doctorName: 'Dr. Karim Messaoudi', specialty: 'Dermatologie', date: '16 Juil 2026', time: '14:00', status: 'pending', color: '#2a9d8f' },
  { id: 3, doctorName: 'Dr. Fatima Zahra Idrissi', specialty: 'Neurologie', date: '18 Juil 2026', time: '11:15', status: 'confirmed', color: '#8e44ad' },
];

export const MOCK_STATS = {
  nextAppointment: { date: '14 Juil', sub: '09:30 — Cardiologie' },
  total: { value: 24, sub: '+3 ce mois-ci' },
  doctorsConsulted: { value: 8, sub: '5 spécialités' },
  attendanceRate: { value: '92%', sub: '2 annulations' },
};