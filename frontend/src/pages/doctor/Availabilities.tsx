import { useEffect, useState, useMemo, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorAvailabilitiesApi } from '../../api/doctorAvailabilities';
import { doctorPlanningApi } from '../../api/doctorPlanning';
import type { Availability } from '../../types';

type CellStatus = 'available' | 'blocked' | 'unavailable' | 'booked';

const DAY_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

// ---------- Helpers dates / heures ----------

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMondayOfWeek(anchor: Date): Date {
  const d = new Date(anchor);
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(anchor: Date): Date[] {
  const monday = getMondayOfWeek(anchor);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function addDaysToDate(anchor: Date, days: number): Date {
  const d = new Date(anchor);
  d.setDate(d.getDate() + days);
  return d;
}

function generateTimeSlots(): string[] {
  // Créneaux de 30 min, de 08:00 à 17:30 (dernier créneau se termine à 18:00)
  const slots: string[] = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function weekRangeLabel(dates: Date[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(last);
  const year = last.getFullYear();
  return `Semaine du ${first.getDate()} – ${last.getDate()} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

const cellKey = (dateKey: string, time: string) => `${dateKey}_${time}`;

export default function Availabilities() {
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [rawAvailabilities, setRawAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // État local de la grille (modifiable par clic, pas encore envoyé au serveur)
  const [grid, setGrid] = useState<Record<string, CellStatus>>({});
  // État d'origine (tel que reçu du serveur), pour calculer les changements à Enregistrer
  const [original, setOriginal] = useState<Record<string, CellStatus>>({});
  // ids des créneaux existants (pour toggle-block / delete)
  const [slotIds, setSlotIds] = useState<Record<string, number>>({});

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const fetchAvailabilities = useCallback(() => {
    setLoading(true);
    setError('');
    doctorAvailabilitiesApi.list()
      .then((res) => setRawAvailabilities(res.data))
      .catch(() => setError('Impossible de charger les disponibilités.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  // Reconstruit la grille (état + ids) à chaque changement de données serveur ou de semaine affichée
  useEffect(() => {
    const nextGrid: Record<string, CellStatus> = {};
    const nextIds: Record<string, number> = {};

    const byKey = new Map<string, Availability>();
    rawAvailabilities.forEach((slot) => {
      byKey.set(cellKey(slot.date.split('T')[0], slot.start_time.slice(0, 5)), slot);
    });

    weekDates.forEach((d) => {
      const dateKey = formatDateKey(d);
      timeSlots.forEach((time) => {
        const key = cellKey(dateKey, time);
        const slot = byKey.get(key);

        if (!slot) {
          nextGrid[key] = 'unavailable';
        } else {
          nextIds[key] = slot.id;
          nextGrid[key] = slot.is_booked ? 'booked' : slot.is_blocked ? 'blocked' : 'available';
        }
      });
    });

    setGrid(nextGrid);
    setOriginal(nextGrid);
    setSlotIds(nextIds);
  }, [rawAvailabilities, weekDates, timeSlots]);

  const handleCellClick = (key: string) => {
    setGrid((prev) => {
      const current = prev[key];
      if (current === 'booked') return prev; // jamais modifiable

      const next: CellStatus =
        current === 'unavailable' ? 'available' :
        current === 'available' ? 'blocked' :
        'unavailable'; // blocked -> unavailable

      return { ...prev, [key]: next };
    });
  };

  const hasChanges = Object.keys(grid).some((key) => grid[key] !== original[key]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const changedKeys = Object.keys(grid).filter((key) => grid[key] !== original[key]);

    try {
      for (const key of changedKeys) {
        const [dateKey, time] = [key.slice(0, 10), key.slice(11)];
        const from = original[key];
        const to = grid[key];
        const existingId = slotIds[key];

        if (from === 'unavailable' && to === 'available') {
          await doctorAvailabilitiesApi.create({
            date: dateKey,
            start_time: time,
            end_time: addMinutes(time, 30),
          });
        } else if (from === 'unavailable' && to === 'blocked') {
          const res = await doctorAvailabilitiesApi.create({
            date: dateKey,
            start_time: time,
            end_time: addMinutes(time, 30),
          });
          await doctorPlanningApi.toggleBlock(res.data.id);
        } else if (from === 'available' && to === 'blocked' && existingId) {
          await doctorPlanningApi.toggleBlock(existingId);
        } else if (from === 'blocked' && to === 'available' && existingId) {
          await doctorPlanningApi.toggleBlock(existingId);
        } else if ((from === 'available' || from === 'blocked') && to === 'unavailable' && existingId) {
          await doctorAvailabilitiesApi.remove(existingId);
        }
      }

      fetchAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement des créneaux.");
    } finally {
      setSaving(false);
    }
  };

  const goPrevWeek = () => setWeekAnchor((d) => addDaysToDate(d, -7));
  const goNextWeek = () => setWeekAnchor((d) => addDaysToDate(d, 7));

  const CELL_STYLES: Record<CellStatus, { bg: string; color: string; content: string; clickable: boolean }> = {
    available: { bg: '#2563eb', color: 'white', content: '✓', clickable: true },
    blocked: { bg: 'rgba(224, 80, 122, 0.1)', color: '#e0507a', content: '🔒', clickable: true },
    unavailable: { bg: 'var(--bg)', color: 'var(--text-muted)', content: '—', clickable: true },
    booked: { bg: '#2563eb', color: 'white', content: '✓', clickable: false },
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Mes disponibilités</h1>
          <p className="page-subtitle">Définissez et gérez vos créneaux de disponibilité</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '10px',
            background: hasChanges ? '#2563eb' : 'var(--border)',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📄 {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Légende + navigation semaine */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text)' }}>
            <LegendDot color="#2563eb" label="Disponible" />
            <LegendDot color="#e0507a" bgLight label="Bloqué" />
            <LegendDot color="var(--border)" label="Non disponible" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={goPrevWeek} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>‹</button>
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {weekRangeLabel(weekDates)}
            </span>
            <button onClick={goNextWeek} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>›</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                    HEURE
                  </th>
                  {weekDates.map((d, i) => (
                    <th key={i} style={{ padding: '14px 10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                      {DAY_LABELS[i]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 20px', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {time}
                    </td>
                    {weekDates.map((d, i) => {
                      const dateKey = formatDateKey(d);
                      const key = cellKey(dateKey, time);
                      const status = grid[key] ?? 'unavailable';
                      const style = CELL_STYLES[status];

                      return (
                        <td key={i} style={{ padding: '6px 8px' }}>
                          <button
                            onClick={() => style.clickable && handleCellClick(key)}
                            disabled={!style.clickable}
                            style={{
                              width: '100%',
                              padding: '10px 0',
                              borderRadius: '8px',
                              border: 'none',
                              background: style.bg,
                              color: style.color,
                              fontWeight: 700,
                              fontSize: '13px',
                              cursor: style.clickable ? 'pointer' : 'default',
                            }}
                          >
                            {style.content}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function LegendDot({ color, label, bgLight }: { color: string; label: string; bgLight?: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: bgLight ? 'rgba(224, 80, 122, 0.15)' : color,
          border: bgLight ? `1px solid ${color}` : 'none',
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}
