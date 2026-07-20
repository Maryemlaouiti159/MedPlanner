import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientDoctorsApi } from '../../api/patientDoctors';
import { patientAppointmentsApi } from '../../api/patientAppointments';
import type { Doctor, Availability } from '../../types';

type Step = 1 | 2 | 3;

function groupByDate(items: Availability[]): Record<string, Availability[]> {
  return items.reduce((acc, item) => {
    const key = item.date.split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, Availability[]>);
}

function shortDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

function fullDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const formatted = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctorId = Number(id);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [consultationType, setConsultationType] = useState<'in_person' | 'teleconsultation' | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      patientDoctorsApi.show(doctorId),
      patientDoctorsApi.availabilities(doctorId),
    ])
      .then(([doctorRes, availRes]) => {
        setDoctor(doctorRes.data);
        setAvailabilities(availRes.data);
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const grouped = groupByDate(availabilities);
  const sortedDates = Object.keys(grouped).sort();
  const slotsForSelectedDate = selectedDate ? grouped[selectedDate] || [] : [];

  const initials = doctor ? `${doctor.user.first_name[0]}${doctor.user.last_name[0]}`.toUpperCase() : '';

  const handleConfirm = async () => {
    if (!selectedSlot || !consultationType) return;
    setSubmitting(true);
    setError('');

    try {
      await patientAppointmentsApi.create({
        availability_id: selectedSlot.id,
        consultation_type: consultationType,
        reason: reason || undefined,
      });
      navigate('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !doctor) {
    return <DashboardLayout><div className="empty-state">Chargement...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <button className="profile-back" onClick={() => navigate('/doctors')} style={{ marginBottom: '16px' }}>←</button>

      <div className="booking-summary-card">
        <div className="booking-summary-doctor">
          <div className="find-doctor-avatar">{initials}</div>
          <div>
            <h3>Dr. {doctor.user.first_name} {doctor.user.last_name}</h3>
            <span>{doctor.specialty.name}{doctor.city ? ` · ${doctor.city}` : ''}</span>
          </div>
        </div>
        <div>
          <div className="booking-summary-price-label">Tarif</div>
          <div className="booking-summary-price-value">{doctor.consultation_price ? `${doctor.consultation_price} DT` : '—'}</div>
        </div>
      </div>

      <div className="booking-steps">
        <div className={`booking-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
          <div className="booking-step-circle">{step > 1 ? '✓' : '1'}</div>
          <span className="booking-step-label">Date & Heure</span>
        </div>
        <div className={`booking-step-line ${step > 1 ? 'done' : ''}`} />
        <div className={`booking-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
          <div className="booking-step-circle">{step > 2 ? '✓' : '2'}</div>
          <span className="booking-step-label">Type & Motif</span>
        </div>
        <div className={`booking-step-line ${step > 2 ? 'done' : ''}`} />
        <div className={`booking-step ${step === 3 ? 'active' : ''}`}>
          <div className="booking-step-circle">3</div>
          <span className="booking-step-label">Confirmation</span>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {step === 1 && (
        <div className="booking-content-card">
          <h3>Choisissez une date</h3>
          {sortedDates.length === 0 ? (
            <div className="empty-state">Aucun créneau disponible pour le moment.</div>
          ) : (
            <>
              <div className="booking-date-grid">
                {sortedDates.map((date) => (
                  <button
                    key={date}
                    className={`booking-date-btn ${selectedDate === date ? 'selected' : ''}`}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                  >
                    {shortDateLabel(date)}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <>
                  <h3>Choisissez un horaire</h3>
                  <div className="booking-time-grid">
                    {slotsForSelectedDate.map((slot) => (
                      <button
                        key={slot.id}
                        className={`booking-time-btn ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.start_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div className="booking-actions">
            <button
              className="booking-btn-next"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
            >
              Continuer →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="booking-content-card">
          <h3>Type de consultation</h3>
          <div className="consultation-type-grid">
            <div
              className={`consultation-type-card ${consultationType === 'in_person' ? 'selected' : ''}`}
              onClick={() => setConsultationType('in_person')}
            >
              <div className="consultation-type-icon">🏥</div>
              <p>En présentiel</p>
              <span>Au cabinet médical</span>
            </div>
            <div
              className={`consultation-type-card ${consultationType === 'teleconsultation' ? 'selected' : ''}`}
              onClick={() => setConsultationType('teleconsultation')}
            >
              <div className="consultation-type-icon">💻</div>
              <p>Téléconsultation</p>
              <span>En ligne via vidéo</span>
            </div>
          </div>

          <h3>Motif de consultation</h3>
          <textarea
            className="booking-reason-textarea"
            placeholder="Décrivez brièvement le motif de votre consultation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="booking-actions between">
            <button className="booking-btn-back" onClick={() => setStep(1)}>← Retour</button>
            <button className="booking-btn-next" disabled={!consultationType} onClick={() => setStep(3)}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {step === 3 && selectedSlot && (
        <div className="booking-content-card">
          <h3>Récapitulatif de la réservation</h3>

          <div className="booking-recap-table">
            <div className="booking-recap-row">
              <span className="booking-recap-label">Médecin</span>
              <span className="booking-recap-value">Dr. {doctor.user.first_name} {doctor.user.last_name}</span>
            </div>
            <div className="booking-recap-row">
              <span className="booking-recap-label">Spécialité</span>
              <span className="booking-recap-value">{doctor.specialty.name}</span>
            </div>
            <div className="booking-recap-row">
              <span className="booking-recap-label">Date</span>
              <span className="booking-recap-value">{fullDateLabel(selectedSlot.date)}</span>
            </div>
            <div className="booking-recap-row">
              <span className="booking-recap-label">Horaire</span>
              <span className="booking-recap-value">{selectedSlot.start_time.slice(0, 5)}</span>
            </div>
            <div className="booking-recap-row">
              <span className="booking-recap-label">Type</span>
              <span className="booking-recap-value">{consultationType === 'in_person' ? 'En présentiel' : 'Téléconsultation'}</span>
            </div>
            {doctor.city && (
              <div className="booking-recap-row">
                <span className="booking-recap-label">Lieu</span>
                <span className="booking-recap-value">{doctor.city}</span>
              </div>
            )}
            {doctor.consultation_price && (
              <div className="booking-recap-row">
                <span className="booking-recap-label">Tarif</span>
                <span className="booking-recap-value">{doctor.consultation_price} DT</span>
              </div>
            )}
          </div>

          <div className="booking-info-banner">
            ℹ️ Une notification de confirmation vous sera envoyée après validation.
          </div>

          <div className="booking-actions between">
            <button className="booking-btn-back" onClick={() => setStep(2)}>← Retour</button>
            <button className="booking-btn-next" onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Confirmation...' : '✓ Confirmer le rendez-vous'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}