import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { secretaryDashboardApi } from '../../api/secretaryDashboard';
import type { SecretaryDashboard } from '../../types';

const STAT_CONFIG = [
  { key: 'today_appointments', label: "RDV aujourd'hui", icon: '📅', accent: 'blue' },
  { key: 'confirmed_appointments', label: 'Confirmés', icon: '✅', accent: 'green' },
  { key: 'pending_appointments', label: 'En attente', icon: '⏳', accent: 'amber' },
  { key: 'patients', label: 'Patients', icon: '👥', accent: 'purple' },
] as const;

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
        <div className="empty-state skeleton-state">
          <div className="skeleton-hero" />
          <div className="skeleton-stats">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="empty-state">
          <p>😕 Impossible de charger le dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  const initials = data.doctor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout>
      {/* HERO */}
      <section className="patient-welcome-banner">
        <div className="patient-welcome-left">
          <p className="patient-welcome-badge">Bonjour 👋</p>
          <p className="patient-welcome-title">{data.secretary.name}</p>
          <p className="patient-welcome-text">
            Vous gérez le planning du
            <strong> {data.doctor.name}</strong>.
          </p>
        </div>

        <div className="patient-welcome-card pdash-doctor-card">
          <div className="pdash-doctor-avatar">{initials}</div>
          <div>
            <p className="patient-welcome-card-label">Médecin</p>
            <h3 className="patient-welcome-card-title">{data.doctor.name}</h3>
            <p className="patient-welcome-card-meta">{data.doctor.specialty}</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="pdash-stats">
        {STAT_CONFIG.map((stat, i) => (
          <div
            className={`pdash-stat-card pdash-accent-${stat.accent}`}
            key={stat.key}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="pdash-stat-top">
              <span className="pdash-stat-label">{stat.label}</span>
              <div className="pdash-stat-icon">{stat.icon}</div>
            </div>
            <div className="pdash-stat-value">{data.stats[stat.key]}</div>
          </div>
        ))}
      </div>

      {/* PLANNING */}
      <div className="pdash-card">
        <div className="pdash-card-header">
          <h2>Planning du jour</h2>
          <span className="pdash-card-count">{data.today_schedule.length} RDV</span>
        </div>

        {data.today_schedule.length === 0 ? (
          <div className="empty-state pdash-empty-planning">
            <p>🗓️ Aucun rendez-vous aujourd'hui.</p>
          </div>
        ) : (
          <div className="pdash-appt-list">
            {data.today_schedule.map((appointment, i) => (
              <div
                className="pdash-appt-row"
                key={appointment.id}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="pdash-appt-time-badge">{appointment.time.slice(0, 5)}</div>

                <div className="pdash-appt-info">
                  <p>{appointment.patient}</p>
                  <span>{appointment.reason ?? 'Consultation'}</span>
                </div>

                <span
                  className={`pdash-pill ${
                    appointment.status === 'confirmed' ? 'confirmed' : 'pending'
                  }`}
                >
                  {appointment.status === 'confirmed' ? '✓ Confirmé' : '⏳ En attente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}