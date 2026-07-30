import api from './axios';

export const secretaryAppointmentsApi = {
  get() {
    return api.get('/secretary/appointments');
  },

  confirm(id: number) {
    return api.patch(`/secretary/appointments/${id}/confirm`);
  },

  cancel(id: number) {
    return api.patch(`/secretary/appointments/${id}/cancel`);
  },

  reschedule(id: number, availabilityId: number) {
    return api.patch(`/secretary/appointments/${id}/reschedule`, {
      availability_id: availabilityId,
    });
  },
};
