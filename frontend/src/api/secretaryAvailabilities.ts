import api from './axios';
import type { Availability } from '../types';

export const secretaryAvailabilitiesApi = {
  list() {
    return api.get<Availability[]>('/secretary/availabilities');
  },
};