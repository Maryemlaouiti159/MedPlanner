import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import { greeting, todayLabel } from '../utils/date';
import { MOCK_UPCOMING_APPOINTMENTS, MOCK_STATS } from '../data/mockDashboard';
export default function Dashboard() {
  const { user } = useAuth();

  const initials = (name: string) =>
    name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{greeting()}, {user?.first_name} 👋</h1>
          <p className="dashboard-date">{todayLabel()} — Voici votre résumé médical du jour.</p>
        </div>
        <button className="btn-cta">+ Nouveau rendez-vous</button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="📅" iconBg="var(--accent-bg)"
          value={MOCK_STATS.nextAppointment.date} label="Prochain rendez-vous"
          sub={MOCK_STATS.nextAppointment.sub} subColor="var(--text-h)"
        />
        <StatCard
          icon="💓" iconBg="var(--success-bg)"
          value={MOCK_STATS.total.value} label="Total rendez-vous"
          sub={MOCK_STATS.total.sub} subColor="var(--success)"
        />
        <StatCard
          icon="🧑‍🤝‍🧑" iconBg="var(--lilac-bg)"
          value={MOCK_STATS.doctorsConsulted.value} label="Médecins consultés"
          sub={MOCK_STATS.doctorsConsulted.sub} subColor="var(--lilac)"
        />
        <StatCard
          icon="📈" iconBg="rgba(245, 158, 11, 0.12)"
          value={MOCK_STATS.attendanceRate.value} label="Taux de présence"
          sub={MOCK_STATS.attendanceRate.sub} subColor="#f59e0b"
        />
      </div>

      <div className="dashboard-columns">
        <div className="list-card">
          <div className="list-card-header">
            <h2>Prochains rendez-vous</h2>
            <a>Voir tout ›</a>
          </div>

          {MOCK_UPCOMING_APPOINTMENTS.map((appt) => (
            <div className="list-row" key={appt.id}>
              <div className="list-row-avatar" style={{ background: appt.color }}>
                {initials(appt.doctorName)}
              </div>
              <div className="list-row-info">
                <p>{appt.doctorName}</p>
                <span>{appt.specialty}</span>
              </div>
              <div className="list-row-meta">
                <span className="list-row-date">{appt.date}</span>
                <span className="list-row-time">🕐 {appt.time}</span>
              </div>
              <span className={`status-pill ${appt.status === 'confirmed' ? 'active' : 'pending'}`}>
                {appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
              </span>
            </div>
          ))}

          <button className="list-card-footer-link">+ Planifier un rendez-vous</button>
        </div>

        <div className="quick-actions-card">
          <h2>Actions rapides</h2>

          <button className="quick-action-row">
            <span className="quick-action-icon" style={{ background: '#1e3a5f22', color: '#1e3a5f' }}>📅</span>
            <span>Prendre un rendez-vous</span>
            <span className="quick-action-chevron">›</span>
          </button>

          <button className="quick-action-row">
            <span className="quick-action-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🩺</span>
            <span>Trouver un médecin</span>
            <span className="quick-action-chevron">›</span>
          </button>

          <button className="quick-action-row">
            <span className="quick-action-icon" style={{ background: 'var(--lilac-bg)', color: 'var(--lilac)' }}>📋</span>
            <span>Voir mon planning</span>
            <span className="quick-action-chevron">›</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}