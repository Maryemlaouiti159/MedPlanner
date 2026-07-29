import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorPlanningApi, type PlanningData } from '../../api/doctorPlanning';

const initials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

// Palette cyclique pour les avatars des patients
const AVATAR_COLORS = ['#0e9f8e', '#c026a3', '#6b5acd', '#e07a1f', '#1e293b', '#e0507a'];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: 'rgba(14, 159, 142, 0.12)', color: '#0e9f8e', label: '✓ Confirmé' },
  pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', label: '⏱ En attente' },
  cancelled: { bg: 'rgba(214, 59, 59, 0.12)', color: '#d63b3b', label: '✕ Annulé' },
  completed: { bg: 'rgba(107, 114, 128, 0.12)', color: '#6b7280', label: '✓ Terminé' },
};

function monthYearLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const formatted = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(d);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function addDays(dateStr: string, days: number): string {
  // ⚠️ Ne jamais utiliser toISOString() ici : ça convertit en UTC et décale
  // la date d'un jour pour tout fuseau horaire en avance sur UTC (ex: UTC+1, Tunisie).
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DoctorPlanning() {
  const [data, setData] = useState<PlanningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = useCallback((date?: string) => {
    setLoading(true);
    doctorPlanningApi.get(date)
      .then((res) => {
        setData(res.data);
        setSelectedDate(res.data.selected_date);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goToDay = (date: string) => loadData(date);
  const goPrevWeek = () => selectedDate && loadData(addDays(selectedDate, -7));
  const goNextWeek = () => selectedDate && loadData(addDays(selectedDate, 7));

  const handleToggleBlock = async (availabilityId: number) => {
    setTogglingId(availabilityId);
    try {
      await doctorPlanningApi.toggleBlock(availabilityId);
      if (selectedDate) loadData(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la mise à jour du créneau.');
    } finally {
      setTogglingId(null);
    }
  };

  // Associe chaque créneau réservé au patient correspondant, pour afficher son prénom sur le slot
  const patientByAvailabilityId = new Map<number, { first_name: string; last_name: string }>();
  data?.appointments.forEach((appt) => {
    patientByAvailabilityId.set(appt.availability.id, appt.patient);
  });

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="empty-state">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="empty-state">Erreur lors du chargement du planning.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-h)' }}>
            Mon planning
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
            Consultez votre agenda et gérez les créneaux
          </p>
        </div>

        {/* Sélecteur de semaine */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={goPrevWeek}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'var(--text-muted)',
              padding: '4px 8px',
            }}
            aria-label="Semaine précédente"
          >
            ‹
          </button>

          <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {data.week.map((day) => {
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  onClick={() => goToDay(day.date)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isSelected ? '#2563eb' : 'transparent',
                    color: isSelected ? 'white' : 'var(--text)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day.label} {day.day_number}
                </button>
              );
            })}
          </div>

          <button
            onClick={goNextWeek}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'var(--text-muted)',
              padding: '4px 8px',
            }}
            aria-label="Semaine suivante"
          >
            ›
          </button>
        </div>

        {/* Contenu principal : créneaux + RDV du jour */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* ---------- Créneaux ---------- */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-h)' }}>
                Créneaux — {selectedDate ? monthYearLabel(selectedDate) : ''}
              </h2>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                <LegendDot color="#22c55e" label="Libre" />
                <LegendDot color="#2563eb" label="Pris" />
                <LegendDot color="#e0507a" label="Bloqué" />
              </div>
            </div>

            {data.availabilities.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                Aucun créneau pour ce jour.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {data.availabilities.map((slot) => {
                  const patient = patientByAvailabilityId.get(slot.id);
                  const isToggling = togglingId === slot.id;

                  let bg = 'rgba(34, 197, 94, 0.08)';
                  let border = '1px solid rgba(34, 197, 94, 0.35)';
                  let color = '#16a34a';

                  if (slot.status === 'booked') {
                    bg = '#2563eb';
                    border = '1px solid #2563eb';
                    color = 'white';
                  } else if (slot.status === 'blocked') {
                    bg = 'rgba(224, 80, 122, 0.1)';
                    border = '1px solid rgba(224, 80, 122, 0.4)';
                    color = '#e0507a';
                  }

                  return (
                    <button
                      key={slot.id}
                      onClick={() => slot.status !== 'booked' && handleToggleBlock(slot.id)}
                      disabled={slot.status === 'booked' || isToggling}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '10px',
                        background: bg,
                        border,
                        color,
                        fontWeight: 700,
                        fontSize: '13.5px',
                        cursor: slot.status === 'booked' ? 'default' : 'pointer',
                        opacity: isToggling ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span>{slot.start_time.slice(0, 5)}</span>
                      {patient && (
                        <span style={{ fontSize: '11.5px', fontWeight: 600, opacity: 0.9 }}>
                          {patient.first_name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------- RDV du jour ---------- */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-h)' }}>
                RDV du jour
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {data.appointments.length} patient{data.appointments.length > 1 ? 's' : ''}
              </span>
            </div>

            {data.appointments.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                Aucun rendez-vous ce jour-là.
              </div>
            ) : (
              <div>
                {data.appointments.map((appt, i) => {
                  const statusStyle = STATUS_STYLES[appt.status] ?? STATUS_STYLES.pending;
                  return (
                    <div
                      key={appt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '16px 24px',
                        borderBottom: i < data.appointments.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '44px' }}>
                        {appt.availability.start_time.slice(0, 5)}
                      </div>

                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          flexShrink: 0,
                        }}
                      >
                        {initials(appt.patient.first_name, appt.patient.last_name)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-h)' }}>
                          {appt.patient.first_name} {appt.patient.last_name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {appt.reason || 'Consultation'}
                        </div>
                      </div>

                      <span
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}
