import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAppointmentsApi, type AdminAppointment } from '../../api/adminAppointments';

type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

interface AppointmentDetail {
  status: string;
  consultation_type: string;
  reason?: string | null;
  patient: { first_name: string; last_name: string };
  doctor: {
    specialty: { name: string };
    user: { first_name: string; last_name: string };
  };
  availability: { date: string; start_time: string };
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  confirmed: { label: 'Confirmé', color: 'text-[#059669] bg-[#d1fae5] border-[#86efac]' },
  pending: { label: 'En attente', color: 'text-[#d97706] bg-[#fff6e6] border-[#fde68a]' },
  cancelled: { label: 'Annulé', color: 'text-[#dc2626] bg-[#fee2e2] border-[#fca5a5]' },
};

const statusFilters: { label: string; value: AppointmentStatus | undefined }[] = [
  { label: 'Tous', value: undefined },
  { label: 'Confirmé', value: 'confirmed' },
  { label: 'En attente', value: 'pending' },
  { label: 'Annulé', value: 'cancelled' },
];

export default function AdminAppointmentsList() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<AppointmentStatus | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewLoadingId, setViewLoadingId] = useState<number | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  type SortField = 'patient_name' | 'doctor_name' | 'date' | 'status';
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAppointmentsApi.list(currentFilter);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les rendez-vous. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Close modals with Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteModal) setDeleteModal(false);
      else if (showModal) setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteModal, showModal]);

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((appt) =>
      appt.patient_name.toLowerCase().includes(term) ||
      appt.doctor_name.toLowerCase().includes(term)
    );
  }, [appointments, searchTerm]);

  const sortedAppointments = useMemo(() => {
    const list = [...filteredAppointments];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'patient_name':
          comparison = a.patient_name.localeCompare(b.patient_name, 'fr');
          break;
        case 'doctor_name':
          comparison = a.doctor_name.localeCompare(b.doctor_name, 'fr');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status, 'fr');
          break;
        case 'date':
        default: {
          const dateA = new Date(`${a.date}T${a.start_time || '00:00'}`).getTime();
          const dateB = new Date(`${b.date}T${b.start_time || '00:00'}`).getTime();
          comparison = dateA - dateB;
          break;
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredAppointments, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedAppointments.length / itemsPerPage));

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAppointments.slice(start, start + itemsPerPage);
  }, [sortedAppointments, currentPage]);

  // Reset to page 1 whenever the filter, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter, searchTerm, sortField, sortOrder]);

  // Clamp current page if it becomes out of range (e.g. after a delete)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const openDeleteModal = (id: number) => {
    setAppointmentToDelete(id);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (appointmentToDelete === null) return;
    setDeleting(true);
    try {
      await adminAppointmentsApi.delete(appointmentToDelete);
      await fetchAppointments();
      setDeleteModal(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Échec de la suppression du rendez-vous.");
      setDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = async (id: number) => {
    setViewLoadingId(id);
    try {
      const res = await adminAppointmentsApi.show(id);
      setSelectedAppointment(res.data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les détails de ce rendez-vous.");
    } finally {
      setViewLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0' }}>
              Rendez-vous
            </h1>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
              Consulter et gérer tous les rendez-vous
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher un patient ou un médecin..."
              aria-label="Rechercher un rendez-vous"
              style={{
                width: '320px',
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                fontSize: '15px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', background: '#f9fafb', padding: '6px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              {statusFilters.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setCurrentFilter(filter.value)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: currentFilter === filter.value ? 'white' : 'transparent',
                    color: currentFilter === filter.value ? '#1f2937' : '#9ca3af',
                    cursor: 'pointer',
                    boxShadow: currentFilter === filter.value ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: '20px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              aria-label="Fermer le message d'erreur"
              style={{ border: 'none', background: 'transparent', color: '#991b1b', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {([
                  { field: 'patient_name' as const, label: 'Patient', align: 'left' as const },
                  { field: 'doctor_name' as const, label: 'Médecin', align: 'left' as const },
                  { field: 'date' as const, label: 'Date & Heure', align: 'left' as const },
                  { field: 'status' as const, label: 'Statut', align: 'left' as const },
                ]).map((col) => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    aria-sort={sortField === col.field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{
                      textAlign: col.align,
                      padding: '16px 20px',
                      color: sortField === col.field ? '#1f2937' : '#9ca3af',
                      fontSize: '13px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label} <span style={{ fontSize: '12px', opacity: sortField === col.field ? 1 : 0.5 }}>{sortIcon(col.field)}</span>
                  </th>
                ))}
                <th style={{ textAlign: 'right', padding: '16px 20px', color: '#9ca3af', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>
                    Chargement...
                  </td>
                </tr>
              ) : sortedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                    {appointments.length === 0
                      ? 'Aucun rendez-vous pour le moment.'
                      : 'Aucun rendez-vous ne correspond à votre recherche.'}
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appt) => {
                  const status = statusConfig[appt.status as AppointmentStatus];
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '50%',
                              background: '#2563eb',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                            }}
                          >
                            {appt.patient_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1f2937' }}>{appt.patient_name}</div>
                            <div style={{ fontSize: 13, color: '#9ca3af' }}>Patient</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>🩺 {appt.doctor_name}</div>
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#9ca3af' }}>{appt.specialty}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4b5563' }}>
                        <div style={{ fontWeight: 600 }}>📅 {formatDate(appt.date)}</div>
                        <div style={{ marginTop: 5, color: '#6b7280', fontSize: 13 }}>🕘 {appt.start_time}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {status ? (
                          <span
                            style={{
                              padding: '6px 12px',
                              borderRadius: '999px',
                              fontSize: '13px',
                              fontWeight: 600,
                              border: '1px solid',
                              ...status,
                            }}
                          >
                            {status.label}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>{appt.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleView(appt.id)}
                            disabled={viewLoadingId === appt.id}
                            title="Voir"
                            aria-label={`Voir le rendez-vous de ${appt.patient_name}`}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'transparent',
                              color: '#9ca3af',
                              cursor: viewLoadingId === appt.id ? 'wait' : 'pointer',
                              fontSize: '18px',
                              opacity: viewLoadingId === appt.id ? 0.5 : 1,
                            }}
                          >
                            <span style={{ fontSize: 22 }}>{viewLoadingId === appt.id ? '⏳' : '👁️'}</span>
                          </button>

                          <button
                            onClick={() => openDeleteModal(appt.id)}
                            title="Supprimer"
                            aria-label={`Supprimer le rendez-vous de ${appt.patient_name}`}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'transparent',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              fontSize: '18px',
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!loading && sortedAppointments.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: '1px solid #f3f4f6',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sortedAppointments.length)} sur {sortedAppointments.length} résultat{sortedAppointments.length > 1 ? 's' : ''}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Page précédente"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    color: currentPage === 1 ? '#d1d5db' : '#1f2937',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  ‹ Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and pages adjacent to current
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  })
                  .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((page, idx) =>
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} style={{ padding: '0 6px', color: '#d1d5db' }}>…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: currentPage === page ? '#2563eb' : '#e5e7eb',
                          background: currentPage === page ? '#2563eb' : '#fff',
                          color: currentPage === page ? '#fff' : '#1f2937',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Page suivante"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    color: currentPage === totalPages ? '#d1d5db' : '#1f2937',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Suivant ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedAppointment && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', width: '500px', maxWidth: '90vw', borderRadius: '20px', padding: '30px' }}
          >
            <h2 style={{ marginBottom: '20px' }}>Détails du rendez-vous</h2>
            <p><strong>Patient :</strong> {selectedAppointment.patient.first_name} {selectedAppointment.patient.last_name}</p>
            <p><strong>Médecin :</strong> Dr. {selectedAppointment.doctor.user.first_name} {selectedAppointment.doctor.user.last_name}</p>
            <p><strong>Spécialité :</strong> {selectedAppointment.doctor.specialty.name}</p>
            <p><strong>Date :</strong> {formatDate(selectedAppointment.availability.date)}</p>
            <p><strong>Heure :</strong> {selectedAppointment.availability.start_time}</p>
            <p><strong>Type :</strong> {selectedAppointment.consultation_type}</p>
            <p><strong>Motif :</strong> {selectedAppointment.reason || '-'}</p>
            <p><strong>Statut :</strong> {statusConfig[selectedAppointment.status as AppointmentStatus]?.label || selectedAppointment.status}</p>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          onClick={() => !deleting && setDeleteModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '420px',
              maxWidth: '90vw',
              background: '#fff',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: '55px', marginBottom: '15px' }}>🗑️</div>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>Supprimer le rendez-vous ?</h2>
            <p style={{ marginTop: '15px', color: '#6b7280', lineHeight: '24px' }}>
              Cette action est définitive.
              <br />
              Le rendez-vous sera supprimé et ne pourra plus être récupéré.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Annuler
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
