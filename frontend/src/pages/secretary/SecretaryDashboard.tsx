import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { secretaryDashboardApi } from '../../api/secretaryDashboard';
import type { SecretaryDashboard } from '../../types';

export default function SecretaryDashboard() {
  const [data, setData] = useState<SecretaryDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    secretaryDashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-state">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="empty-state">Impossible de charger le dashboard.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* HERO */}
      <section className="patient-welcome-banner">
        <div className="patient-welcome-left">
          <p className="patient-welcome-badge">Bonjour</p>

          <p className="patient-welcome-title">
            {data.secretary.name}
          </p>

          <p className="patient-welcome-text">
            Vous gérez le planning du
            <strong> {data.doctor.name}</strong>.
          </p>
        </div>

        <div className="patient-welcome-card">
          <p className="patient-welcome-card-label">
            Médecin
          </p>

          <h3 className="patient-welcome-card-title">
            {data.doctor.name}
          </h3>

          <p className="patient-welcome-card-meta">
            {data.doctor.specialty}
          </p>
        </div>
      </section>

      {/* STATS */}

      <div className="pdash-stats">

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">
              RDV aujourd'hui
            </span>
            <div className="pdash-stat-icon">📅</div>
          </div>

          <div className="pdash-stat-value">
            {data.stats.today_appointments}
          </div>
        </div>

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">
              Confirmés
            </span>
            <div className="pdash-stat-icon">
              ✅
            </div>
          </div>

          <div className="pdash-stat-value">
            {data.stats.confirmed_appointments}
          </div>
        </div>

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">
              En attente
            </span>
            <div className="pdash-stat-icon">
              ⏳
            </div>
          </div>

          <div className="pdash-stat-value">
            {data.stats.pending_appointments}
          </div>
        </div>

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">
              Patients
            </span>
            <div className="pdash-stat-icon">
              👥
            </div>
          </div>

          <div className="pdash-stat-value">
            {data.stats.patients}
          </div>
        </div>

      </div>

      {/* PLANNING */}

      <div className="pdash-card">

        <div className="pdash-card-header">
          <h2>Planning du jour</h2>
        </div>

        {data.today_schedule.length === 0 ? (

          <div className="empty-state">
            Aucun rendez-vous aujourd'hui.
          </div>

        ) : (

          data.today_schedule.map((appointment) => (

            <div
              className="pdash-appt-row"
              key={appointment.id}
            >

              <div className="pdash-appt-info">
                <p>{appointment.patient}</p>
                <span>{appointment.reason ?? 'Consultation'}</span>
              </div>

              <div className="pdash-appt-meta">
                {appointment.time.slice(0,5)}
              </div>

              <span
                className={`pdash-pill ${
                  appointment.status === 'confirmed'
                    ? 'confirmed'
                    : 'pending'
                }`}
              >
                {appointment.status}
              </span>

            </div>

          ))

        )}

      </div>

    </DashboardLayout>
  );
}