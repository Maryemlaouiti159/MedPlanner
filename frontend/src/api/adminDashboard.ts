import api from './axios';
import type { AdminStats } from '../types';

export const adminDashboardApi = {
  stats: () => api.get<AdminStats>('/admin/stats'),
};