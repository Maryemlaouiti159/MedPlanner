import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientAppointmentsApi } from '../../api/patientAppointments';
import type { PatientAppointment } from '../../types';
import { Search, Edit, Trash2, X } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  // --- Popup de suppression ---
  const [deleteTarget, setDeleteTarget] = useState<PatientAppointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Popup de modification ---
  const [editTarget, setEditTarget] = useState<PatientAppointment | null>(null);
  const [editConsultationType, setEditConsultationType] = useState<'in_person' | 'teleconsultation'>('in_person');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<number | null>(null);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    patientAppointmentsApi.list()
      .then((res) => {
        setAppointments(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, statusFilter]);

  // ---------- Suppression ----------
  const openDeleteModal = (appt: PatientAppointment) => setDeleteTarget(appt);
  const closeDeleteModal = () => { if (!deleting) setDeleteTarget(null); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await patientAppointmentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Modification ----------
  const openEditModal = (appt: PatientAppointment) => {
    setEditError(null);

    setEditConsultationType(
      appt.consultation_type === 'in_person'
        ? 'in_person'
        : 'teleconsultation'
    );

    setSelectedAvailability(appt.availability.id);

    setEditTarget(appt);

    // charger les créneaux du médecin
    fetchDoctorAvailabilities(appt.doctor.id);
  };

  const fetchDoctorAvailabilities = async (doctorId: number) => {
    try {
      const res = await patientAppointmentsApi.availabilities(doctorId);
      setAvailabilities(res.data);
    } catch (error) {
      console.error("Erreur chargement disponibilités", error);
    }
  };

  const closeEditModal = () => { if (!saving) setEditTarget(null); };

  const saveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    setEditError(null);
    try {
      const data: any = {};

      if (selectedAvailability !== editTarget.availability.id) {
        data.availability_id = selectedAvailability;
      }

      if (editConsultationType !== editTarget.consultation_type) {
        data.consultation_type = editConsultationType;
      }

      await patientAppointmentsApi.update(editTarget.id, data);
      setEditTarget(null);
      fetchAppointments();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (appt: PatientAppointment) => {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    try {
      await patientAppointmentsApi.cancel(appt.id);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Erreur lors de l'annulation.");
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

  const filteredAppts = (activeTab === 'upcoming'
    ? upcomingAppts
    : historyAppts)
    .filter((appt) => {
      const doctor =
        `${appt.doctor.user.first_name} ${appt.doctor.user.last_name}`.toLowerCase();

      const matchesSearch = doctor.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || appt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  const totalPages = Math.ceil(filteredAppts.length / perPage);

  const paginatedAppointments = filteredAppts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Style commun pour les groupes de boutons segmentés (tabs + filtre statut)
  const segmentedButtonStyle = (active: boolean) => ({
    background: active ? 'var(--card)' : 'transparent',
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: active ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  });

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
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={segmentedButtonStyle(activeTab === 'upcoming')}
          >
            À venir ({upcomingAppts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={segmentedButtonStyle(activeTab === 'history')}
          >
            Historique ({historyAppts.length})
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 15,
            marginBottom: 25,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '8px 12px',
              background: 'white',
            }}
          >
            <Search size={18} />

            <input
              placeholder="Rechercher un médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                marginLeft: 10,
              }}
            />
          </div>

          {/* Filtre statut : même design que le sélecteur À venir / Historique */}
          <div style={{
            display: 'inline-flex',
            background: '#E8EEF5',
            padding: '4px',
            borderRadius: '10px',
            gap: '4px',
            flexWrap: 'wrap',
          }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                style={segmentedButtonStyle(statusFilter === f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
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
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {paginatedAppointments.map((appt) => (
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

                {/* Status & Actions */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      background: appt.status === 'completed'
                        ? 'var(--muted)'
                        : appt.status === 'cancelled'
                          ? 'var(--destructive-foreground)'
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

                  {/* Bouton "Rejoindre la consultation" — visible uniquement si téléconsultation confirmée avec un lien vidéo */}
                  {appt.consultation_type === 'teleconsultation' &&
                    appt.status === 'confirmed' &&
                    appt.video_link && (
                      <a
                        href={appt.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          fontSize: '12px',
                          borderRadius: '8px',
                          background: '#16a34a',
                          color: 'white',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        🎥 Rejoindre la consultation
                      </a>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(appt)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: 'none',
                        background: '#2563eb',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(appt)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: 'none',
                        background: '#dc2626',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {activeTab === 'upcoming' && (appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button
                      type="button"
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

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 15,
                marginTop: 30,
              }}
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ◀ Précédent
              </button>

              <span>
                Page {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant ▶
              </button>
            </div>
          )}
        </>
      )}

      {/* ---------- Popup de confirmation de suppression ---------- */}
      {deleteTarget && (
        <div
          onClick={closeDeleteModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--foreground)' }}>
                Supprimer le rendez-vous
              </h3>
              <button
                type="button"
                onClick={closeDeleteModal}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 12, lineHeight: 1.5 }}>
              Voulez-vous vraiment supprimer définitivement le rendez-vous avec{' '}
              <strong>Dr. {deleteTarget.doctor.user.first_name} {deleteTarget.doctor.user.last_name}</strong> ?
              Cette action est irréversible.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Popup de modification ---------- */}
      {editTarget && (
        <div
          onClick={closeEditModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--foreground)' }}>
                Modifier le rendez-vous
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', marginTop: 8 }}>
              Dr. {editTarget.doctor.user.first_name} {editTarget.doctor.user.last_name} —{' '}
              {new Date(editTarget.availability.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
              à {editTarget.availability.start_time.slice(0, 5).replace(':', 'h')}
            </p>

            <div style={{ marginTop: 18 }}>
              <div style={{ marginTop: 18 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: 8
                  }}
                >
                  Nouveau créneau
                </label>

                <select
                  value={selectedAvailability ?? ''}
                  onChange={(e) =>
                    setSelectedAvailability(Number(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <option value="">
                    Choisir un créneau
                  </option>

                  {availabilities
                    .filter(
                      (slot) =>
                        !slot.is_booked ||
                        slot.id === editTarget?.availability.id
                    )
                    .map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.date} - {slot.start_time.slice(0, 5)}
                      </option>
                  ))}
                </select>
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', display: 'block', marginTop: 18, marginBottom: 8 }}>
                Type de consultation
              </label>
              <div style={{
                display: 'inline-flex',
                background: '#E8EEF5',
                padding: '4px',
                borderRadius: '10px',
                gap: '4px',
              }}>
                <button
                  type="button"
                  onClick={() => setEditConsultationType('in_person')}
                  style={segmentedButtonStyle(editConsultationType === 'in_person')}
                >
                  En cabinet
                </button>
                <button
                  type="button"
                  onClick={() => setEditConsultationType('teleconsultation')}
                  style={segmentedButtonStyle(editConsultationType === 'teleconsultation')}
                >
                  Téléconsultation
                </button>
              </div>
            </div>

            {editError && (
              <p style={{ color: 'var(--destructive)', fontSize: 13, marginTop: 14 }}>
                {editError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
