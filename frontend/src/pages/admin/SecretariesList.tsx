import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSecretariesApi } from '../../api/adminSecretaries';
import { adminUsersApi } from '../../api/adminUsers';
import type { Secretary } from '../../types';

type SortField = 'secretary_name' | 'doctor_name' | 'status';

export default function SecretariesList() {
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState<SortField>('secretary_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchSecretaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminSecretariesApi.list();
      setSecretaries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSecretaries(); }, [fetchSecretaries]);

  const handleToggleStatus = async (secretary: Secretary) => {
    try {
      await adminUsersApi.toggleStatus(secretary.user.id);
      fetchSecretaries();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur.');
    }
  };

  // Recherche (secrétaire, médecin associé, email)
  const filteredSecretaries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return secretaries;
    return secretaries.filter((s) => {
      const secName = `${s.user.first_name} ${s.user.last_name}`.toLowerCase();
      const email = s.user.email?.toLowerCase() ?? '';
      const docName = `${s.doctor.user.first_name} ${s.doctor.user.last_name}`.toLowerCase();
      return secName.includes(term) || email.includes(term) || docName.includes(term);
    });
  }, [secretaries, searchTerm]);

  // Tri
  const sortedSecretaries = useMemo(() => {
    const list = [...filteredSecretaries];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'secretary_name': {
          const nameA = `${a.user.first_name} ${a.user.last_name}`;
          const nameB = `${b.user.first_name} ${b.user.last_name}`;
          comparison = nameA.localeCompare(nameB, 'fr');
          break;
        }
        case 'doctor_name': {
          const nameA = `${a.doctor.user.first_name} ${a.doctor.user.last_name}`;
          const nameB = `${b.doctor.user.first_name} ${b.doctor.user.last_name}`;
          comparison = nameA.localeCompare(nameB, 'fr');
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
  }, [filteredSecretaries, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedSecretaries.length / itemsPerPage));

  const paginatedSecretaries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedSecretaries.slice(start, start + itemsPerPage);
  }, [sortedSecretaries, currentPage]);

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
          <h1 className="page-title">Secrétaires</h1>
          <p className="page-subtitle">{secretaries.length} secrétaire{secretaries.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <p className="form-hint">
        Les secrétaires sont créées automatiquement avec leur médecin et supprimées avec lui (page "Médecins").
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0' }}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Rechercher une secrétaire ou un médecin..."
          aria-label="Rechercher une secrétaire"
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
        ) : sortedSecretaries.length === 0 ? (
          <div className="empty-state">
            {secretaries.length === 0
              ? 'Aucune secrétaire trouvée.'
              : 'Aucune secrétaire ne correspond à votre recherche.'}
          </div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('secretary_name')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'secretary_name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Secrétaire <span style={{ opacity: sortField === 'secretary_name' ? 1 : 0.5 }}>{sortIcon('secretary_name')}</span>
                  </th>
                  <th onClick={() => handleSort('doctor_name')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'doctor_name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Médecin associé <span style={{ opacity: sortField === 'doctor_name' ? 1 : 0.5 }}>{sortIcon('doctor_name')}</span>
                  </th>
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }} aria-sort={sortField === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Statut <span style={{ opacity: sortField === 'status' ? 1 : 0.5 }}>{sortIcon('status')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSecretaries.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="user-cell-name">{s.user.first_name} {s.user.last_name}</div>
                      <div className="user-cell-email">{s.user.email}</div>
                    </td>
                    <td>Dr {s.doctor.user.first_name} {s.doctor.user.last_name}</td>
                    <td>
                      <button
                        className={`status-toggle ${s.user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(s)}
                      >
                        {s.user.is_active ? 'Actif' : 'Inactif'}
                      </button>
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
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sortedSecretaries.length)} sur {sortedSecretaries.length} résultat{sortedSecretaries.length > 1 ? 's' : ''}
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
    </DashboardLayout>
  );
}
