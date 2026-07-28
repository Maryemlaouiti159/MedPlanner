import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { patientAppointmentsApi } from '../api/patientAppointments';
import { patientDoctorsApi } from '../api/patientDoctors';
import { fetchNotifications } from '../api/notifications';
import type { PatientAppointment, Doctor, AppNotification } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientAppointmentsApi.list(),
      patientDoctorsApi.list(),
      user ? fetchNotifications() : Promise.resolve([]),
    ])
      .then(([apptRes, docRes, notifs]) => {
setAppointments(apptRes.data.data);
        setDoctors(docRes.data);
        setNotifications(notifs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const initials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

  const now = new Date();
  const upcoming = appointments
    .filter((a) => (a.status === 'pending' || a.status === 'confirmed') && new Date(a.availability.date) >= now)
    .sort((a, b) => new Date(a.availability.date).getTime() - new Date(b.availability.date).getTime());

  const totalCount = appointments.length;
  const uniqueDoctors = new Set(appointments.map((a) => a.doctor.id)).size;
  const recommendedDoctors = doctors.slice(0, 4);
  const nextAppointment = upcoming[0] ?? null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-state">Chargement...</div>
      </DashboardLayout>
    );
  }

  const onBook = () => navigate('/doctors');

  return (
    <DashboardLayout>
      <section className="patient-welcome-banner">
        <div className="patient-welcome-left">
          <p className="patient-welcome-badge">Bonjour</p>
          <h2 className="patient-welcome-title">{user?.first_name} {user?.last_name}</h2>
          <p className="patient-welcome-text">
            Vous avez <span className="patient-welcome-strong">{upcoming.length} rendez-vous</span> à venir cette semaine.
          </p>
          <button className="patient-welcome-button" onClick={onBook}>
            <Plus size={16} /> Prendre un rendez-vous
          </button>
        </div>

        <div className="patient-welcome-card">
          {nextAppointment ? (
            <>
              <p className="patient-welcome-card-label">Prochain rendez-vous</p>
              <h3 className="patient-welcome-card-title">
                {new Date(nextAppointment.availability.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </h3>
              <p className="patient-welcome-card-text">
                {nextAppointment.availability.start_time.slice(0, 5)} · Dr. {nextAppointment.doctor.user.first_name} {nextAppointment.doctor.user.last_name}
              </p>
              <p className="patient-welcome-card-meta">{nextAppointment.doctor.specialty.name}</p>
            </>
          ) : (
 <img
          src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=280&h=180&fit=crop&auto=format"
          alt="Medical"
          className="hidden lg:block w-48 h-32 object-cover rounded-2xl opacity-80"
        />          )}
        </div>
      </section>

      <div className="pdash-stats">
        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">Rendez-vous à venir</span>
            <div className="pdash-stat-icon" style={{ background: 'var(--success-bg)' }}>📅</div>
          </div>
          <div className="pdash-stat-value">{upcoming.length}</div>
          <div className="pdash-stat-sub">
            {upcoming[0]
              ? `Prochain: ${new Date(upcoming[0].availability.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
              : 'Aucun à venir'}
          </div>
        </div>

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">Consultations totales</span>
            <div className="pdash-stat-icon" style={{ background: 'var(--accent-bg)' }}>💠</div>
          </div>
          <div className="pdash-stat-value">{totalCount}</div>
          <div className="pdash-stat-sub">Depuis votre inscription</div>
        </div>

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">Médecins consultés</span>
            <div className="pdash-stat-icon" style={{ background: 'var(--lilac-bg)' }}>🩺</div>
          </div>
          <div className="pdash-stat-value">{uniqueDoctors}</div>
          <div className="pdash-stat-sub">Spécialités diverses</div>
        </div>

        <div className="pdash-stat-card">
          <div className="pdash-stat-top">
            <span className="pdash-stat-label">Notifications</span>
            <div className="pdash-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>🔔</div>
          </div>
          <div className="pdash-stat-value">{notifications.filter(n => !n.isRead).length}</div>
          <div className="pdash-stat-sub">Non lues</div>
        </div>
      </div>

      <div className="pdash-columns">
        <div className="pdash-card">
          <div className="pdash-card-header">
            <h2>Prochains rendez-vous</h2>
            <a onClick={() => navigate('/appointments')}>Voir tout →</a>
          </div>

          {upcoming.length === 0 ? (
            <div className="empty-state">Aucun rendez-vous à venir.</div>
          ) : (
            upcoming.slice(0, 5).map((appt) => (
              <div className="pdash-appt-row" key={appt.id}>
                <div className="pdash-appt-avatar">
                  {initials(appt.doctor.user.first_name, appt.doctor.user.last_name)}
                </div>
                <div className="pdash-appt-info">
                  <p>Dr. {appt.doctor.user.first_name} {appt.doctor.user.last_name}</p>
                  <span>{appt.doctor.specialty.name}</span>
                </div>
                <div className="pdash-appt-meta">
                  <span className="pdash-appt-date">
                    {new Date(appt.availability.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="pdash-appt-time">{appt.availability.start_time.slice(0, 5)}</span>
                </div>
                <span className={`pdash-pill ${appt.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                  {appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pdash-card">
          <div className="pdash-card-header">
            <h2>Actions rapides</h2>
          </div>

          <button className="pdash-action-row" onClick={() => navigate('/doctors')}>
            <div className="pdash-action-icon" style={{ background: 'var(--accent-bg)' }}>🔍</div>
            <div className="pdash-action-text">
              <p>Trouver un médecin</p>
              <span>Par spécialité ou nom</span>
            </div>
            <span className="pdash-action-chevron">›</span>
          </button>

          <button className="pdash-action-row" onClick={() => navigate('/appointments')}>
            <div className="pdash-action-icon" style={{ background: 'var(--success-bg)' }}>📅</div>
            <div className="pdash-action-text">
              <p>Mes rendez-vous</p>
              <span>Gérer mes consultations</span>
            </div>
            <span className="pdash-action-chevron">›</span>
          </button>

          <button className="pdash-action-row" onClick={() => navigate('/settings?tab=notifications')}>
            <div className="pdash-action-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>🔔</div>
            <div className="pdash-action-text">
              <p>Notifications</p>
              <span>{notifications.filter(n => !n.isRead).length} non lue{notifications.filter(n => !n.isRead).length > 1 ? 's' : ''}</span>
            </div>
            <span className="pdash-action-chevron">›</span>
          </button>
        </div>
      </div>

      <div className="pdash-columns">
        <div className="pdash-card">
          <div className="pdash-card-header">
            <h2>Médecins recommandés</h2>
            <a onClick={() => navigate('/doctors')}>Explorer →</a>
          </div>

          {recommendedDoctors.length === 0 ? (
            <div className="empty-state">Aucun médecin disponible.</div>
          ) : (
            <div className="pdash-doctors-grid">
              {recommendedDoctors.map((doc) => (
                <div className="pdash-doctor-mini" key={doc.id} onClick={() => navigate(`/doctors/${doc.id}`)}>
                  <div className="pdash-doctor-mini-top">
                    <div className="pdash-doctor-mini-avatar">
                      {initials(doc.user.first_name, doc.user.last_name)}
                    </div>
                    <div>
                      <p className="pdash-doctor-mini-name">Dr. {doc.user.first_name} {doc.user.last_name}</p>
                      <span className="pdash-doctor-mini-spec">{doc.specialty.name}</span>
                    </div>
                  </div>
                  <span className="pdash-doctor-mini-tag">Disponible</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pdash-card">
          <div className="pdash-card-header">
            <h2>Notifications récentes</h2>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">Aucune notification.</div>
          ) : (
            notifications.map((n) => (
              <div className="pdash-notif-row" key={n.id}>
                <div className="pdash-notif-icon" style={{ background: n.iconBg }}>{n.icon}</div>
                <div className="pdash-notif-text">
                  <p>{n.title}</p>
                  <span>{n.subtitle} · {n.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
