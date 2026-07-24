import api from './axios';

export const secretaryDashboardApi = {
    get() {
        return api.get('/secretary/dashboard');
    }
};