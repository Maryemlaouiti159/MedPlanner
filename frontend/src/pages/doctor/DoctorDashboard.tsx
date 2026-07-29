import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorDashboardApi, type DoctorDashboardData } from '../../api/doctorDashboard';

function formatFullDate(): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const initials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

// Palette cyclique pour les avatars des patients (couleurs distinctes, comme sur la maquette)
const AVATAR_COLORS = ['#0e9f8e', '#c026a3', '#6b5acd', '#e07a1f', '#1e293b', '#e0507a'];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: 'rgba(14, 159, 142, 0.12)', color: '#0e9f8e', label: '✓ Confirmé' },
  pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', label: '⏱ En attente' },
  cancelled: { bg: 'rgba(214, 59, 59, 0.12)', color: '#d63b3b', label: '✕ Annulé' },
  completed: { bg: 'rgba(107, 114, 128, 0.12)', color: '#6b7280', label: '✓ Terminé' },
};

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

  const confirmedToday = data.today_appointments.filter((a) => a.status === 'confirmed').length;
  const weekTotal = data.week_counts.reduce((sum, day) => sum + day.count, 0);
  const weekMax = Math.max(...data.week_counts.map((d) => d.count), 1);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ---------- Bannière médecin ---------- */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #16213e 0%, #0e5257 100%)',
            color: 'white',
            padding: '32px 36px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '220px',
              height: '220px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
            }}
          />
         <div
  style={{
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '30px',
  }}
>
  <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
              {formatFullDate()}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700,color: 'rgba(255,255,255,0.7)', margin: '0 0 4px 0' }}>
              Dr. {user?.first_name} {user?.last_name}
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 24px 0' }}>
              {data.doctor.specialty?.name || 'Médecin'}
              {data.doctor.city ? ` · ${data.doctor.city}` : ''}
            </p>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{data.today_appointments.length}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>RDV aujourd'hui</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{confirmedToday}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Confirmés</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{data.pending_appointments.length}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>En attente</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{data.stats.total_patients}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Patients total</div>
                
              </div>
             
            </div>
          </div> {/* fin partie gauche */}

<img
  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=260&h=160&fit=crop&auto=format"
  alt="Medical"
  style={{
    width: '250px',
    height: '170px',
    objectFit: 'cover',
    borderRadius: '18px',
    flexShrink: 0,
  }}
/>

</div> {/* fin flex */}
</div> {/* fin bannière */}
        {/* ---------- Cartes de statistiques ---------- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <StatCard
            icon="🩺"
            iconBg="rgba(37, 99, 235, 0.12)"
            iconColor="#2563eb"
            value={weekTotal}
            label="Consultations cette semaine"
          />
         
          <StatCard
            icon="👥"
            iconBg="rgba(14, 159, 142, 0.12)"
            iconColor="#0e9f8e"
            value={data.stats.total_patients}
            label="Patients suivis"
          />
          <StatCard
            icon="⏳"
            iconBg="rgba(107, 90, 205, 0.12)"
            iconColor="#6b5acd"
            value={data.stats.pending_count}
            label="Demandes à traiter"
          />
        </div>
{/* ---------- Graphique + Planning ---------- */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px',
    alignItems: 'start',
  }}
>
  {/* ===== Graphique ===== */}
  <div
    style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
    }}
  >
    <h2
      style={{
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 4px 0',
        color: 'var(--text-h)',
      }}
    >
      Patients / jour — semaine en cours
    </h2>

    <p
      style={{
        fontSize: '12.5px',
        color: 'var(--text-muted)',
        margin: '0 0 20px 0',
      }}
    >
      {formatFullDate()}
    </p>

    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        height: '160px',
      }}
    >
      {data.week_counts.map((day, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '32px',
              height: `${(day.count / weekMax) * 100}%`,
              minHeight: day.count > 0 ? '4px' : '0px',
              background: '#0e9f8e',
              borderRadius: '6px 6px 0 0',
            }}
          />

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}
          >
            {day.day.charAt(0).toUpperCase() + day.day.slice(1, 3)}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* ===== Planning ===== */}
  <div>
 <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-h)' }}>
              Planning d'aujourd'hui
            </h2>
            <span
              onClick={() => navigate('/appointments')}
              style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 500, cursor: 'pointer' }}
            >
              Voir tout →
            </span>
          </div>

          {data.today_appointments.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              Aucun rendez-vous aujourd'hui.
            </div>
          ) : (
           <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }}
>
              {data.today_appointments.map((appt, i) => {
                const statusStyle = STATUS_STYLES[appt.status] ?? STATUS_STYLES.pending;
                return (
                  <div
                    key={appt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                          flexShrink: 0,
                        }}
                      >
                        {initials(appt.patient.first_name, appt.patient.last_name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-h)' }}>
                          {appt.patient.first_name} {appt.patient.last_name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {appt.reason || 'Consultation'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🕒 {appt.availability.start_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>  </div>
</div>
        
          

        
       

        {/* ---------- Demandes en attente (actions Accepter/Refuser) ---------- */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-h)' }}>
              Demandes en attente
            </h2>
            {data.pending_appointments.length > 0 && (
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {data.pending_appointments.length} à traiter
              </span>
            )}
          </div>

          {data.pending_appointments.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              Aucune demande en attente.
            </div>
          ) : (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              {data.pending_appointments.map((appt, i) => (
                <div
                  key={appt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: i < data.pending_appointments.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px',
                      marginRight: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {initials(appt.patient.first_name, appt.patient.last_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
                      {appt.patient.first_name} {appt.patient.last_name}
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                      {appt.reason || 'Consultation'} ·{' '}
                      {new Date(appt.availability.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} à{' '}
                      {appt.availability.start_time.slice(0, 5)}
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
                        cursor: 'pointer',
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
                        cursor: 'pointer',
                      }}
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          marginBottom: '16px',
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
