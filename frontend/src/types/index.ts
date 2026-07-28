export type UserRole = 'patient' | 'doctor' | 'admin' | 'secretary';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}
export interface Secretary {
  id: number;
  user_id: number;
  doctor_id: number;
  user: User;
  doctor: Doctor;
}
export interface UserFilters {
  sort_by?: 'first_name' | 'created_at' | 'role' | 'is_active' | 'email';
  sort_order?: 'asc' | 'desc';
}
export interface UpdateSecretaryData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  doctor_id?: number;
}
export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}
// ===== Gestion des utilisateurs (admin) =====

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface UserFilters {
  role?: UserRole | '';
  search?: string;
  is_active?: '' | '0' | '1';
  page?: number;
}

// ===== Dashboard admin =====

export interface RecentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface RecentAppointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  date: string;
  start_time: string;
  status: string;
  reason: string;
}

export interface MonthlyRegistration {
  name: string;
  inscriptions: number;
}

export interface TopDoctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews_count: number;
}

export interface AdminStats {
  total_users: number;
  patients: number;
  doctors: number;
  secretaries: number;
  admins: number;
  active_users: number;
  inactive_users: number;
  recent_users: RecentUser[];
  recent_appointments: RecentAppointment[];
  monthly_registrations: MonthlyRegistration[];
  top_doctors: TopDoctor[];
}
export interface Specialty {
  id: number;
  name: string;
  description: string | null;
}
export type NotificationType =
  | 'CONFIRMATION'
  | 'RAPPEL'
  | 'MODIFICATION'
  | 'ANNULATION'
  | 'INFO'
  | 'NOUVEAU_PATIENT'
  | 'NOUVEL_AJOUT';
export interface AppNotification {
  id: number | string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  type?: NotificationType;
  isRead?: boolean;
}
export interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  bio: string | null;
  address: string | null;
  city: string | null;
  consultation_duration: number;
  consultation_price: number | null;
  user: User;
  specialty: Specialty;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'patient' | 'admin';
  is_active?: boolean;
}
export interface Availability {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityData {
  date: string;
  start_time: string;
  end_time: string;
}
export interface CreateDoctorData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialty_id: number;
  bio?: string;
  address?: string;
  city?: string;
  consultation_duration?: number;
  consultation_price?: number;
  secretary_first_name: string;
  secretary_last_name: string;
  secretary_email: string;
  secretary_phone?: string;
}

export interface UpdateDoctorData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  specialty_id?: number;
  bio?: string;
  address?: string;
  city?: string;
  consultation_duration?: number;
  consultation_price?: number;
}
export interface Availability {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}


// Étend Doctor (ajoute juste ce champ à ton interface Doctor existante)
// next_slot?: NextSlot | null;
export interface PatientAppointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  availability_id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string | null;
  consultation_type: 'in_person' | 'teleconsultation';
  created_at: string;
  doctor: Doctor;
  availability: Availability;
  video_room_id: string | null;
  video_link: string | null;
}

export interface CreateAppointmentData {
  availability_id: number;
  consultation_type: 'in_person' | 'teleconsultation';
  reason?: string;
}
export interface PatientDoctor {
  id: number;
  bio: string | null;
  address: string | null;
  city: string | null;
  consultation_duration: number;
  consultation_price: string | null;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  specialty: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  availability_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string | null;
  created_at: string;
  doctor: PatientDoctor;
  availability: Availability;
}

export interface CreateAppointmentData {
  availability_id: number;
  reason?: string;
}

export interface SecretaryDashboard {
    doctor: {
        id: number;
        name: string;
        specialty: string;
    };

    secretary: {
        name: string;
    };

    stats: {
        today_appointments: number;
        confirmed_appointments: number;
        pending_appointments: number;
        patients: number;
    };

    today_schedule: {
        id: number;
        time: string;
        patient: string;
        status: string;
        reason: string | null;
    }[];

    notifications: AppNotification[];
}