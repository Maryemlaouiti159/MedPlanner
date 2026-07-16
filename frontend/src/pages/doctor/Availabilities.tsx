import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorAvailabilitiesApi } from '../../api/doctorAvailabilities';
import type { Availability } from '../../types';

function groupByDate(items: Availability[]): Record<string, Availability[]> {
  return items.reduce((acc, item) => {
    const cleanDate = item.date.split('T')[0]; // 👈 normalise la clé
    if (!acc[cleanDate]) acc[cleanDate] = [];
    acc[cleanDate].push(item);
    return acc;
  }, {} as Record<string, Availability[]>);
}

function formatDateLabel(dateStr: string): string {
  // Extrait juste la partie YYYY-MM-DD, peu importe le format reçu (avec ou sans heure)
  const cleanDate = dateStr.split('T')[0];
  const date = new Date(cleanDate + 'T00:00:00');

  if (isNaN(date.getTime())) {
    return dateStr; // repli si le format est vraiment inattendu
  }

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function Availabilities() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ date: '', start_time: '', end_time: '' });

  const fetchAvailabilities = () => {
    setLoading(true);
    doctorAvailabilitiesApi.list()
      .then((res) => setAvailabilities(res.data))
      .catch(() => setError('Impossible de charger les disponibilités.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await doctorAvailabilitiesApi.create(form);
      setForm({ date: '', start_time: '', end_time: '' });
      fetchAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du créneau.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce créneau ?')) return;

    try {
      await doctorAvailabilitiesApi.remove(id);
      fetchAvailabilities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de supprimer ce créneau.');
    }
  };

  const grouped = groupByDate(availabilities);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes disponibilités</h1>
          <p className="page-subtitle">Ajoutez des créneaux pour que les patients puissent réserver</p>
        </div>
      </div>

      <div className="availability-form-card">
        <h2>Ajouter un créneau</h2>

        {error && <div className="alert alert-error" style={{ marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="availability-form-row">
          <div className="availability-form-field">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="availability-form-field">
            <label>Heure de début</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>

          <div className="availability-form-field">
            <label>Heure de fin</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={creating}>
            {creating ? 'Ajout...' : '+ Ajouter'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : sortedDates.length === 0 ? (
        <div className="empty-state">Aucune disponibilité pour le moment. Ajoutez votre premier créneau ci-dessus.</div>
      ) : (
        sortedDates.map((date) => (
          <div className="availability-group" key={date}>
            <div className="availability-group-date">{formatDateLabel(date)}</div>
            <div className="availability-slots">
              {grouped[date].map((slot) => (
                <div key={slot.id} className={`availability-slot ${slot.is_booked ? 'booked' : ''}`}>
                  🕐 {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                  {slot.is_booked ? (
                    <span style={{ fontSize: '11px' }}>Réservé</span>
                  ) : (
                    <button className="availability-slot-remove" onClick={() => handleDelete(slot.id)}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </DashboardLayout>
  );
}