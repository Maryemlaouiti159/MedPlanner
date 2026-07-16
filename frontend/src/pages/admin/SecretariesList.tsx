import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSecretariesApi } from '../../api/adminSecretaries';
import { adminUsersApi } from '../../api/adminUsers';
import type { Secretary } from '../../types';
export default function SecretariesList() {
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);

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

      <div className="users-table-card">
        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : secretaries.length === 0 ? (
          <div className="empty-state">Aucune secrétaire trouvée.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Secrétaire</th>
                <th>Médecin associé</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {secretaries.map((s) => (
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
        )}
      </div>
    </DashboardLayout>
  );
}