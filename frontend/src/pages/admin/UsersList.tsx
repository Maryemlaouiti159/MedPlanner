import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateUserModal from '../../components/admin/CreateUserModal';
import { adminUsersApi } from '../../api/adminUsers';
import type { User, UserFilters, UserRole } from '../../types';
import EditUserModal from '../../components/admin/EditUserModal';
const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  admin: 'Admin',
  secretary: 'Secrétaire',
};

// Rôles modifiables directement depuis cette page.
// doctor/secretary passent par la page "Médecins" (profil requis).
const EDITABLE_ROLES: UserRole[] = ['patient', 'admin'];

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    search: '',
    is_active: '',
  });

  const fetchUsers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await adminUsersApi.list({ ...filters, page });
      setUsers(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleRoleChange = async (userId: number, role: UserRole) => {
    if (!EDITABLE_ROLES.includes(role)) return;
    try {
      await adminUsersApi.changeRole(userId, role as 'patient' | 'admin');
      fetchUsers(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors du changement de rôle.');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await adminUsersApi.toggleStatus(userId);
      fetchUsers(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur.');
    }
  };

  const handleDelete = async (user: User) => {
    if (user.role === 'doctor' || user.role === 'secretary') {
      alert('Utilisez la page "Médecins" pour supprimer un médecin (sa secrétaire sera retirée automatiquement).');
      return;
    }
    if (!confirm(`Supprimer ${user.first_name} ${user.last_name} ? Cette action est irréversible.`)) return;

    try {
      await adminUsersApi.remove(user.id);
      fetchUsers(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const initials = (u: User) => `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{total} utilisateur{total > 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Nouvel utilisateur
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          className="filter-search"
          placeholder="Rechercher par nom ou email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select
          className="filter-select"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | '' })}
        >
          <option value="">Tous les rôles</option>
          <option value="patient">Patient</option>
          <option value="doctor">Médecin</option>
          <option value="secretary">Secrétaire</option>
          <option value="admin">Admin</option>
        </select>

        <select
          className="filter-select"
          value={filters.is_active}
          onChange={(e) => setFilters({ ...filters, is_active: e.target.value as '' | '0' | '1' })}
        >
          <option value="">Tous les statuts</option>
          <option value="1">Actif</option>
          <option value="0">Inactif</option>
        </select>
      </div>

      <div className="users-table-card">
        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Aucun utilisateur trouvé.</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar">{initials(u)}</div>
                        <div>
                          <div className="user-cell-name">{u.first_name} {u.last_name}</div>
                          <div className="user-cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      {EDITABLE_ROLES.includes(u.role) ? (
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        >
                          <option value="patient">Patient</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="role-badge" title="Géré via la page Médecins">
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${u.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
  <div className="table-actions">
    <button
      className="icon-btn"
      onClick={() => setEditingUser(u)}
      title="Modifier"
    >
      ✏️
    </button>
    <button
      className="icon-btn danger"
      onClick={() => handleDelete(u)}
      title="Supprimer"
    >
      🗑️
    </button>
  </div>
</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-bar">
              <span className="pagination-info">
                Page {currentPage} sur {lastPage}
              </span>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => fetchUsers(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  className="pagination-btn"
                  disabled={currentPage === lastPage}
                  onClick={() => fetchUsers(currentPage + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
{editingUser && (
  <EditUserModal
    user={editingUser}
    onClose={() => setEditingUser(null)}
    onUpdated={() => fetchUsers(currentPage)}
  />
)}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => fetchUsers(currentPage)}
        />
      )}
    </DashboardLayout>
  );
}