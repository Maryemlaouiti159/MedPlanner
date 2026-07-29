import api from './axios';

export interface WeekDay {
  date: string;
  label: string;
  day_number: number;
  is_selected: boolean;
}

export interface PlanningAvailability {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  is_blocked: boolean;
  status: 'free' | 'booked' | 'blocked';
}

export interface PlanningAppointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string | null;
  consultation_type: 'in_person' | 'teleconsultation';
  patient: {
    id: number;
    first_name: string;
    last_name: string;
  };
  availability: {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
  };
}

export interface PlanningData {
  selected_date: string;
  week: WeekDay[];
  availabilities: PlanningAvailability[];
  appointments: PlanningAppointment[];
}

export const doctorPlanningApi = {
  get: (date?: string) =>
    api.get<PlanningData>('/doctor/planning', {
      params: date ? { date } : {},
    }),

  toggleBlock: (availabilityId: number) =>
    api.patch<PlanningAvailability>(`/doctor/planning/availability/${availabilityId}/toggle-block`),
};