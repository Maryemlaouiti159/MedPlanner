import api from './axios';

export interface PublicStats {
  patients_count: number;
  doctors_count: number;
  specialties_count: number;
}

export interface FeaturedDoctor {
  id: number;
  name: string;
  specialty: string;
  city: string | null;
}

export const publicApi = {
  stats: () => api.get<PublicStats>('/public/stats'),
  featuredDoctors: () => api.get<FeaturedDoctor[]>('/public/featured-doctors'),
};