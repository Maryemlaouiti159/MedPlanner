import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateDoctorModal from '../../components/admin/CreateDoctorModal';
import { adminDoctorsApi } from '../../api/adminDoctors';
import { adminUsersApi } from '../../api/adminUsers';
import type { Doctor } from '../../types';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleDelete = async (doctor: Doctor) => {
    const name = `${doctor.user.first_name} ${doctor.user.last_name}`;
    if (!confirm(`Supprimer Dr ${name} ? Sa secrétaire sera également supprimée. Action irréversible.`)) return;
    try {
      await adminDoctorsApi.remove(doctor.id);
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression.');
    }
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

      <div className="users-table-card">
        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">Aucun médecin trouvé.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Spécialité (ID)</th>
                <th>Ville</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
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
        )}
      </div>

      {showCreateModal && (
        <CreateDoctorModal onClose={() => setShowCreateModal(false)} onCreated={fetchDoctors} />
      )}
    </DashboardLayout>
  );
}