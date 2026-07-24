import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorDashboardApi, type DoctorDashboardData } from '../../api/doctorDashboard';

function formatDayLabel(): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
  return formatted.toUpperCase();
}

const initials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await doctorDashboardApi.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = async (appointmentId: number) => {
    try {
      await doctorDashboardApi.acceptAppointment(appointmentId);
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (appointmentId: number) => {
    try {
      await doctorDashboardApi.rejectAppointment(appointmentId);
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

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
        <div className="empty-state">Erreur lors du chargement des données.</div>
      </DashboardLayout>
    );
  }

  const weekTotal = data.week_counts.reduce((sum, day) => sum + day.count, 0);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ 
              color: 'var(--text-muted)', 
              fontSize: '13px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              {formatDayLabel()}
            </div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              margin: '0 0 8px 0',
              color: 'var(--text-h)'
            }}>
              Bonjour, Dr. {user?.last_name} 👋
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: 'var(--text-muted)',
              margin: 0
            }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{data.today_appointments.length} consultations</span> programmées aujourd'hui · 
              <span style={{ color: '#f59e0b', fontWeight: 600, marginLeft: '4px' }}>{data.pending_appointments.length} demandes</span> en attente
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate('/availabilities')}
              style={{
                padding: '12px 24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🗓️ Gérer disponibilités
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '10px',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ✓ Voir les demandes ({data.pending_appointments.length})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '32px'
        }}>
          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Patients aujourd'hui
              </span>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(107, 90, 205, 0.12)',
                color: '#6b5acd'
              }}>
                👤
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
              {data.stats.today_patients}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {data.stats.today_patients} confirmés
            </div>
          </div>

          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                En attente
              </span>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b'
              }}>
                ⏳
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
              {data.stats.pending_count}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              À confirmer
            </div>
          </div>

          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Patients suivis
              </span>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(14, 159, 142, 0.12)',
                color: '#0e9f8e'
              }}>
                👥
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
              {data.stats.total_patients}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Dossiers actifs
            </div>
          </div>

          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Note moyenne
              </span>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(214, 59, 59, 0.12)',
                color: '#d63b3b'
              }}>
                ⭐
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
              {data.stats.avg_rating}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              312 avis patients
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Today's Schedule */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-h)' }}>
                  Programme du jour
                </h2>
                <span style={{ 
                  fontSize: '14px', 
                  color: 'var(--accent)', 
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  Agenda complet →
                </span>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-muted)', 
                  marginBottom: '20px'
                }}>
                  {formatDayLabel()}
                </div>
                {data.today_appointments.length === 0 ? (
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)',
                    fontSize: '14px'
                  }}>
                    Aucun rendez-vous aujourd'hui.
                  </div>
                ) : (
                  data.today_appointments.map((appt, index) => (
                    <div 
                      key={appt.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        padding: index > 0 ? '20px 0' : '0 0 20px 0',
                        borderBottom: index < data.today_appointments.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      <div style={{ 
                        minWidth: '70px',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-h)',
                        paddingTop: '4px'
                      }}>
                        {appt.availability.start_time.slice(0, 5)}
                      </div>
                      <div style={{ 
                        width: '2px', 
                        height: '100%', 
                        background: 'var(--accent)',
                        marginRight: '20px',
                        borderRadius: '2px'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, var(--accent), var(--lilac))',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '16px'
                          }}>
                            {initials(appt.patient.first_name, appt.patient.last_name)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: 600, 
                              color: 'var(--text-h)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              {appt.patient.first_name} {appt.patient.last_name}
                              {appt.status === 'pending' && (
                                <span style={{ 
                                  background: 'rgba(107, 90, 205, 0.12)', 
                                  color: '#6b5acd', 
                                  fontSize: '11px', 
                                  padding: '3px 8px', 
                                  borderRadius: '6px', 
                                  fontWeight: 600,
                                  textTransform: 'uppercase'
                                }}>
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '13.5px', 
                              color: 'var(--text-muted)',
                              marginTop: '4px'
                            }}>
                              {appt.patient.age || 34} ans · {appt.reason || 'Consultation'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ 
                              background: appt.consultation_type === 'in_person' ? 'rgba(14, 159, 142, 0.12)' : 'rgba(107, 90, 205, 0.12)',
                              color: appt.consultation_type === 'in_person' ? '#0e9f8e' : '#6b5acd',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              {appt.consultation_type === 'in_person' ? '🏥 Présentiel' : '💻 Télé'}
                            </span>
                            <span style={{ 
                              background: appt.status === 'confirmed' ? 'rgba(14, 159, 142, 0.12)' : appt.status === 'pending' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(214, 59, 59, 0.12)',
                              color: appt.status === 'confirmed' ? '#0e9f8e' : appt.status === 'pending' ? '#f59e0b' : '#d63b3b',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {appt.status === 'confirmed' ? 'Confirmé' : appt.status === 'pending' ? 'En attente' : 'Annulé'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Requests */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-h)' }}>
                    Demandes en attente
                  </h2>
                  {data.pending_appointments.length > 0 && (
                    <span style={{ 
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {data.pending_appointments.length} à traiter
                    </span>
                  )}
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  color: 'var(--accent)', 
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  Tout voir →
                </span>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {data.pending_appointments.length === 0 ? (
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)',
                    fontSize: '14px'
                  }}>
                    Aucune demande en attente.
                  </div>
                ) : (
                  data.pending_appointments.map((appt) => (
                    <div 
                      key={appt.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        background: 'var(--border)',
                        color: 'var(--text-h)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        marginRight: '16px'
                      }}>
                        {initials(appt.patient.first_name, appt.patient.last_name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: 'var(--text-h)',
                          marginBottom: '4px'
                        }}>
                          {appt.patient.first_name} {appt.patient.last_name}, {appt.patient.age || 45} ans
                        </div>
                        <div style={{ 
                          fontSize: '13.5px', 
                          color: 'var(--text-muted)'
                        }}>
                          {appt.reason || 'Consultation'} · {new Date(appt.availability.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} à {appt.availability.start_time.slice(0, 5)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleAccept(appt.id)}
                          style={{
                            padding: '8px 18px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'rgba(14, 159, 142, 0.12)',
                            color: '#0e9f8e',
                            fontWeight: 600,
                            fontSize: '13.5px',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Accepter
                        </button>
                        <button 
                          onClick={() => handleReject(appt.id)}
                          style={{
                            padding: '8px 18px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'rgba(214, 59, 59, 0.12)',
                            color: '#d63b3b',
                            fontWeight: 600,
                            fontSize: '13.5px',
                            cursor: 'pointer'
                          }}
                        >
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* This Week Chart */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid var(--border)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-h)' }}>
                  Cette semaine
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                {data.week_counts.map((day, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '60px', fontSize: '14px', fontWeight: 600, color: i === 0 ? 'var(--accent)' : 'var(--text)' }}>
                      {day.day.charAt(0).toUpperCase() + day.day.slice(1, 3)}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      height: '8px', 
                      background: 'var(--border)', 
                      borderRadius: '4px', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${(day.count / (data.stats.today_patients || 1)) * 100}%`,
                        maxWidth: '100%',
                        background: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div style={{ width: '24px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
                      {day.count}
                    </div>
                  </div>
                ))}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px', 
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)' }}>{weekTotal}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Consultations</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)' }}>1 600€</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Honoraires</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-h)' }}>
                  Disponibilités
                </h2>
                <span 
                  onClick={() => navigate('/availabilities')}
                  style={{ 
                    fontSize: '14px', 
                    color: 'var(--accent)', 
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Modifier
                </span>
              </div>
              <div style={{ padding: '24px' }}>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 0',
                    fontSize: '14px',
                    color: i === 4 ? 'var(--text-muted)' : 'var(--text-h)',
                    fontWeight: 500
                  }}>
                    <span>{day}</span>
                    <span style={{ color: '#0e9f8e', fontWeight: 600 }}>
                      {i === 4 ? 'Fermé' : '08h30 - 18h00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Profile Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', 
              borderRadius: '16px', 
              padding: '28px 24px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '-40px', 
                right: '-40px', 
                width: '140px', 
                height: '140px', 
                background: 'rgba(255, 255, 255, 0.07)', 
                borderRadius: '50%' 
              }} />
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '28px'
              }}>
                👩‍⚕️
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
                Dr. {user?.first_name} {user?.last_name}
              </h3>
              <p style={{ 
                fontSize: '14px', 
                margin: '0 0 20px 0',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                {data.doctor.specialty?.name || 'Médecin généraliste'} · {data.doctor.city || 'Paris'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Exp.
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>18 ans</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Patients
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>312+</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Note
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>4.9 ⭐</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Langues
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>FR · EN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
