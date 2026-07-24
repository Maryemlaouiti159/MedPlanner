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
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

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

  const initials = (first: string, last: string) => {
    const f = first ? first[0] : '';
    const l = last ? last[0] : '';
    return `${f}${l}`.toUpperCase();
  };

  const upcomingAppts = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );
  
  const historyAppts = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  const filteredAppts = activeTab === 'upcoming' ? upcomingAppts : historyAppts;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
          letterSpacing: '1.2px'
        }}>
          Agenda
        </span>
        <h1 style={{
          marginTop: '4px',
          marginBottom: '20px',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--foreground)',
          fontFamily: 'var(--heading)'
        }}>
          Mes rendez-vous
        </h1>

        {/* Tab Selector */}
        <div style={{
          display: 'inline-flex',
          background: '#E8EEF5',
          padding: '4px',
          borderRadius: '10px',
          gap: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              background: activeTab === 'upcoming' ? 'var(--card)' : 'transparent',
              color: activeTab === 'upcoming' ? 'var(--foreground)' : 'var(--muted-foreground)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'upcoming' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            À venir ({upcomingAppts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: activeTab === 'history' ? 'var(--card)' : 'transparent',
              color: activeTab === 'history' ? 'var(--foreground)' : 'var(--muted-foreground)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Historique ({historyAppts.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : filteredAppts.length === 0 ? (
        <div className="empty-state" style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--muted-foreground)'
        }}>
          {activeTab === 'upcoming' ? 'Aucun rendez-vous à venir.' : 'Aucun historique de rendez-vous.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAppts.map((appt) => (
            <div
              key={appt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.01)',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                {/* Avatar */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                    color: 'white',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    fontSize: '15px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {initials(appt.doctor.user.first_name, appt.doctor.user.last_name)}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '15.5px',
                    fontWeight: 700,
                    color: 'var(--foreground)'
                  }}>
                    Dr. {appt.doctor.user.first_name} {appt.doctor.user.last_name}
                  </h3>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--muted-foreground)',
                    display: 'block',
                    marginTop: '2px',
                    fontWeight: 500
                  }}>
                    {appt.doctor.specialty.name}
                  </span>

                  {/* Metadata Row */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📅 {new Date(appt.availability.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🕒 {appt.availability.start_time.slice(0, 5).replace(':', 'h')}
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'lowercase',
                      background: 'var(--muted)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      🏢 {appt.consultation_type === 'in_person' ? 'in-person' : 'téléconsultation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Cancel Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span
                  style={{
                    background: appt.status === 'completed'
                      ? 'var(--muted)'
                      : appt.status === 'cancelled'
                        ? 'var(--destructive-foreground)' // soft red fallback or raw rgba
                        : appt.status === 'confirmed'
                          ? 'var(--secondary)'
                          : 'rgba(245, 158, 11, 0.12)',
                    color: appt.status === 'completed'
                      ? 'var(--muted-foreground)'
                      : appt.status === 'cancelled'
                        ? 'var(--destructive)'
                        : appt.status === 'confirmed'
                          ? 'var(--primary)'
                          : '#f59e0b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    backgroundBlendMode: 'normal',
                    backgroundColor: appt.status === 'cancelled' ? 'rgba(214, 59, 59, 0.12)' : undefined
                  }}
                >
                  {STATUS_LABELS[appt.status]}
                </span>

                {activeTab === 'upcoming' && (appt.status === 'pending' || appt.status === 'confirmed') && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleCancel(appt)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontWeight: 600,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}