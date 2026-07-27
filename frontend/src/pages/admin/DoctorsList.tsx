import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateDoctorModal from '../../components/admin/CreateDoctorModal';
import { adminDoctorsApi } from '../../api/adminDoctors';
import { adminUsersApi } from '../../api/adminUsers';
import type { Doctor } from '../../types';

type SortField = 'doctor_name' | 'specialty' | 'city' | 'status';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState<SortField>('doctor_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDoctorsApi.list();
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      await adminUsersApi.toggleStatus(doctor.user.id);
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur.');
    }
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;

    try {
      await adminDoctorsApi.remove(doctorToDelete.id);
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setDoctorToDelete(null);
    }
  };

  // Recherche (nom, prénom, email)
  const filteredDoctors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((d) => {
      const fullName = `${d.user.first_name} ${d.user.last_name}`.toLowerCase();
      const email = d.user.email?.toLowerCase() ?? '';
      const specialty = d.specialty?.name?.toLowerCase() ?? '';
      const city = d.city?.toLowerCase() ?? '';
      return (
        fullName.includes(term) ||
        email.includes(term) ||
        specialty.includes(term) ||
        city.includes(term)
      );
    });
  }, [doctors, searchTerm]);

  // Tri
  const sortedDoctors = useMemo(() => {
    const list = [...filteredDoctors];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'doctor_name': {
          const nameA = `${a.user.first_name} ${a.user.last_name}`;
          const nameB = `${b.user.first_name} ${b.user.last_name}`;
          comparison = nameA.localeCompare(nameB, 'fr');
          break;
        }
        case 'specialty': {
          const specA = a.specialty?.name ?? '';
          const specB = b.specialty?.name ?? '';
          comparison = specA.localeCompare(specB, 'fr');
          break;
        }
        case 'city': {
          const cityA = a.city ?? '';
          const cityB = b.city ?? '';
          comparison = cityA.localeCompare(cityB, 'fr');
          break;
        }
        case 'status':
        default:
          comparison = Number(a.user.is_active) - Number(b.user.is_active);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredDoctors, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedDoctors.length / itemsPerPage));

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedDoctors.slice(start, start + itemsPerPage);
  }, [sortedDoctors, currentPage]);

  // Reset à la page 1 quand la recherche ou le tri change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortOrder]);

  // Clamp de la page courante (ex: après une suppression)
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

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Médecins</h1>
          <p className="page-subtitle">{doctors.length} médecin{doctors.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Nouveau médecin
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Rechercher un médecin, une spécialité, une ville..."
          aria-label="Rechercher un médecin"
          style={{
            width: '320px',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            outline: 'none',
            fontSize: '15px',
          }}
        />
      </div>

      <div className="users-table-card">
        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : sortedDoctors.length === 0 ? (
          <div className="empty-state">
            {doctors.length === 0
              ? 'Aucun médecin trouvé.'
              : 'Aucun médecin ne correspond à votre recherche.'}
          </div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('doctor_name')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'doctor_name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Médecin <span style={{ opacity: sortField === 'doctor_name' ? 1 : 0.5 }}>{sortIcon('doctor_name')}</span>
                  </th>
                  <th onClick={() => handleSort('specialty')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'specialty' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Spécialité <span style={{ opacity: sortField === 'specialty' ? 1 : 0.5 }}>{sortIcon('specialty')}</span>
                  </th>
                  <th onClick={() => handleSort('city')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'city' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Ville <span style={{ opacity: sortField === 'city' ? 1 : 0.5 }}>{sortIcon('city')}</span>
                  </th>
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Statut <span style={{ opacity: sortField === 'status' ? 1 : 0.5 }}>{sortIcon('status')}</span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDoctors.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="user-cell-name">Dr {d.user.first_name} {d.user.last_name}</div>
                      <div className="user-cell-email">{d.user.email}</div>
                    </td>
                    <td>{d.specialty?.name ?? `#${d.specialty_id}`}</td>
                    <td>{d.city || '—'}</td>
                    <td>
                      <button
                        className={`status-toggle ${d.user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(d)}
                      >
                        {d.user.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-btn danger" onClick={() => handleDelete(d)} title="Supprimer">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sortedDoctors.length)} sur {sortedDoctors.length} résultat{sortedDoctors.length > 1 ? 's' : ''}
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
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
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
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateDoctorModal onClose={() => setShowCreateModal(false)} onCreated={fetchDoctors} />
      )}
      {showDeleteModal && doctorToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Supprimer le médecin</h3>

            <p>
              Voulez-vous vraiment supprimer
              <strong>
                {" "}Dr {doctorToDelete.user.first_name}{" "}
                {doctorToDelete.user.last_name}
              </strong>
              ?
            </p>

            <p className="warning-text">
              La secrétaire associée sera également supprimée.
              <br />
              Cette action est irréversible.
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDoctorToDelete(null);
                }}
              >
                Annuler
              </button>

              <button
                className="confirm-btn"
                onClick={confirmDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
