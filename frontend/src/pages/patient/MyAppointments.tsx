import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientAppointmentsApi } from '../../api/patientAppointments';
import type { PatientAppointment } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    patientAppointmentsApi.list()
      .then((res) => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (appt: PatientAppointment) => {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    try {
      await patientAppointmentsApi.cancel(appt.id);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de l\'annulation.');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes rendez-vous</h1>
          <p className="page-subtitle">{appointments.length} rendez-vous</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">Aucun rendez-vous pour le moment.</div>
      ) : (
        <div className="users-table-card">
          {appointments.map((appt) => (
            <div className="appointment-row" key={appt.id}>
              <div className="appointment-row-info">
                <p className="user-cell-name">
                  Dr {appt.doctor.user.first_name} {appt.doctor.user.last_name}
                </p>
                <span className="user-cell-email">{appt.doctor.specialty.name}</span>
                {appt.reason && <span className="appointment-reason">Motif : {appt.reason}</span>}
              </div>
              <div className="appointment-row-date">
                <span className="list-row-date">
                  {new Date(appt.availability.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="list-row-time">
                  🕐 {appt.availability.start_time.slice(0, 5)} - {appt.availability.end_time.slice(0, 5)}
                </span>
              </div>
              <span className={`status-pill ${appt.status === 'confirmed' || appt.status === 'completed' ? 'active' : appt.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                {STATUS_LABELS[appt.status]}
              </span>
              {(appt.status === 'pending' || appt.status === 'confirmed') && (
                <button className="btn-secondary" onClick={() => handleCancel(appt)}>
                  Annuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}