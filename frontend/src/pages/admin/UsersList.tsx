import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateUserModal from '../../components/admin/CreateUserModal';
import { adminUsersApi } from '../../api/adminUsers';
import type { User, UserFilters, UserRole } from '../../types';
import EditUserModal from '../../components/admin/EditUserModal';
import { Filter } from "lucide-react";
const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  admin: 'Admin',
  secretary: 'Secrétaire',
};

// Rôles modifiables directement depuis cette page.
// doctor/secretary passent par la page "Médecins" (profil requis).

// Champs sur lesquels le tri est autorisé.
// NOTE: vérifier que le backend accepte bien ces valeurs pour `sort_by`.
type SortableField = 'first_name' | 'email' | 'role' | 'is_active' | 'created_at';

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [sortBy, setSortBy] = useState<SortableField>('first_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounce pour la recherche (évite un fetch à chaque frappe)
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const fetchUsers = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const response = await adminUsersApi.list({
          ...filters,
          page,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
        setUsers(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setTotal(response.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [filters, sortBy, sortOrder]
  );

  // Reset systématique à la page 1 dès que filtres ou tri changent
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Clic sur un en-tête de colonne triable :
  // - si c'est déjà la colonne active, on inverse l'ordre
  // - sinon on bascule sur la nouvelle colonne en ordre croissant
  const handleSortClick = (field: SortableField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortIndicator = (field: SortableField) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await adminUsersApi.toggleStatus(userId);
      fetchUsers(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur.');
    }
  };

  const handleDelete = (user: User) => {
    if (user.role === 'doctor' || user.role === 'secretary') {
      alert(
        'Utilisez la page "Médecins" pour supprimer un médecin (sa secrétaire sera retirée automatiquement).'
      );
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await adminUsersApi.remove(userToDelete.id);
      fetchUsers(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const initials = (u: User) => {
    const f = u.first_name?.[0] ?? '';
    const l = u.last_name?.[0] ?? '';
    return `${f}${l}`.toUpperCase() || '?';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            {total} utilisateur{total > 1 ? 's' : ''} au total
          </p>
        </div>

        <div className="header-actions">
  <button
  className={`filter-button ${showFilters ? "active" : ""}`}
  onClick={() => setShowFilters(!showFilters)}
  title="Filtrer"
>
  <Filter size={20} strokeWidth={2.2} />
</button>

         

          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Nouvel utilisateur
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-bar">
          <input
            type="text"
            className="filter-search"
            placeholder="Rechercher par nom ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
            onChange={(e) =>
              setFilters({ ...filters, is_active: e.target.value as '' | '0' | '1' })
            }
          >
            <option value="">Tous les statuts</option>
            <option value="1">Actif</option>
            <option value="0">Inactif</option>
          </select>
        </div>
      )}

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
                  <th
                    className="sortable-column"
                    onClick={() => handleSortClick('first_name')}
                    title="Trier par nom"
                  >
                    Utilisateur <span className="sort-icon">{sortIndicator('first_name')}</span>
                  </th>
                  <th>Téléphone</th>
                  <th
                    className="sortable-column"
                    onClick={() => handleSortClick('role')}
                    title="Trier par rôle"
                  >
                    Rôle <span className="sort-icon">{sortIndicator('role')}</span>
                  </th>
                  <th
                    className="sortable-column"
                    onClick={() => handleSortClick('is_active')}
                    title="Trier par statut"
                  >
                    Statut <span className="sort-icon">{sortIndicator('is_active')}</span>
                  </th>
                  <th
                    className="sortable-column"
                    onClick={() => handleSortClick('created_at')}
                    title="Trier par date d'inscription"
                  >
                    Inscrit le <span className="sort-icon">{sortIndicator('created_at')}</span>
                  </th>
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
                          <div className="user-cell-name">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="user-cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`role-badge role-badge-${u.role}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
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
              <button
                className="pagination-nav-link"
                disabled={currentPage === 1}
                onClick={() => fetchUsers(currentPage - 1)}
              >
                Précédent
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter((p) => {
                    if (lastPage <= 7) return true;
                    if (p === 1 || p === lastPage) return true;
                    return Math.abs(p - currentPage) <= 1;
                  })
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`pagination-number ${p === currentPage ? 'active' : ''}`}
                        onClick={() => fetchUsers(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                className="pagination-nav-link"
                disabled={currentPage === lastPage}
                onClick={() => fetchUsers(currentPage + 1)}
              >
                Suivant
              </button>
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

      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Supprimer l'utilisateur</h3>

            <p>
              Voulez-vous vraiment supprimer
              <strong>
                {' '}
                {userToDelete.first_name} {userToDelete.last_name}
              </strong>
              ?
            </p>

            <p className="warning-text">Cette action est irréversible.</p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Annuler
              </button>

              <button className="confirm-btn" onClick={confirmDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
