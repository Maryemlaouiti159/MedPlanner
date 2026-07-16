import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { adminDashboardApi } from '../../api/adminDashboard';
import { greeting, todayLabel } from '../../utils/date';
import type { AdminStats } from '../../types';
const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  secretary: 'Secrétaire',
  admin: 'Admin',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminDashboardApi.stats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const initials = (first: string, last: string) =>
    `${first[0]}${last[0]}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {greeting()}, {user?.first_name}</h1>
          <p className="dashboard-date">{todayLabel()} — Vue d'ensemble de la plateforme.</p>
        </div>
        <button className="btn-cta" onClick={() => navigate('/admin/doctors')}>
          + Ajouter un médecin
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Chargement des statistiques...</div>
      ) : stats ? (
        <>
          <div className="stats-grid">
            <StatCard
              icon="👥" iconBg="var(--accent-bg)"
              value={stats.total_users} label="Utilisateurs au total"
              sub={`${stats.active_users} actifs`} subColor="var(--accent)"
            />
            <StatCard
              icon="🧑‍🤝‍🧑" iconBg="var(--success-bg)"
              value={stats.patients} label="Patients"
              sub="Inscrits sur la plateforme" subColor="var(--success)"
            />
            <StatCard
              icon="🩺" iconBg="var(--lilac-bg)"
              value={stats.doctors} label="Médecins"
              sub="Avec leur secrétaire" subColor="var(--lilac)"
            />
            <StatCard
              icon="📋" iconBg="rgba(245, 158, 11, 0.12)"
              value={stats.secretaries} label="Secrétaires"
              sub={`${stats.admins} administrateur(s)`} subColor="#f59e0b"
            />
          </div>

          <div className="dashboard-columns">
            <div className="list-card">
              <div className="list-card-header">
                <h2>Derniers inscrits</h2>
                <a onClick={() => navigate('/admin/users')}>Voir tout ›</a>
              </div>

              {stats.recent_users.length === 0 ? (
                <div className="empty-state">Aucun utilisateur récent.</div>
              ) : (
                stats.recent_users.map((u) => (
                  <div className="list-row" key={u.id}>
                    <div
                      className="list-row-avatar"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--lilac))' }}
                    >
                      {initials(u.first_name, u.last_name)}
                    </div>
                    <div className="list-row-info">
                      <p>{u.first_name} {u.last_name}</p>
                      <span>{u.email}</span>
                    </div>
                    <div className="list-row-meta">
                      <span className="list-row-date">{ROLE_LABELS[u.role] || u.role}</span>
                      <span className="list-row-time">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <button className="list-card-footer-link" onClick={() => navigate('/admin/users')}>
                + Gérer tous les utilisateurs
              </button>
            </div>

            <div className="quick-actions-card">
              <h2>Actions rapides</h2>

              <button className="quick-action-row" onClick={() => navigate('/admin/doctors')}>
                <span className="quick-action-icon" style={{ background: 'var(--lilac-bg)', color: 'var(--lilac)' }}>🩺</span>
                <span>Ajouter un médecin</span>
                <span className="quick-action-chevron">›</span>
              </button>

              <button className="quick-action-row" onClick={() => navigate('/admin/specialties')}>
                <span className="quick-action-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>🏷️</span>
                <span>Gérer les spécialités</span>
                <span className="quick-action-chevron">›</span>
              </button>

              <button className="quick-action-row" onClick={() => navigate('/admin/users')}>
                <span className="quick-action-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>👥</span>
                <span>Gérer les utilisateurs</span>
                <span className="quick-action-chevron">›</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">Impossible de charger les statistiques.</div>
      )}
    </DashboardLayout>
  );
}