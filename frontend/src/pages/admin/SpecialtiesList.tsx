import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { specialtiesApi } from '../../api/specialties';
import type { Specialty } from '../../types';
export default function SpecialtiesList() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await specialtiesApi.list();
      setSpecialties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSpecialties(); }, [fetchSpecialties]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (s: Specialty) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description ?? '' });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await specialtiesApi.update(editing.id, form);
      } else {
        await specialtiesApi.create(form);
      }
      setShowForm(false);
      fetchSpecialties();
    } catch (err: any) {
      setError(err.response?.data?.errors?.name?.[0] ?? err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleDelete = (s: Specialty) => {
  setSpecialtyToDelete(s);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!specialtyToDelete) return;

  try {
    await specialtiesApi.remove(specialtyToDelete.id);
    fetchSpecialties();
  } catch (err: any) {
    alert(err.response?.data?.message ?? 'Erreur lors de la suppression.');
  } finally {
    setShowDeleteModal(false);
    setSpecialtyToDelete(null);
  }
};

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Spécialités</h1>
          <p className="page-subtitle">{specialties.length} spécialité{specialties.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nouvelle spécialité</button>
      </div>

      <div className="users-table-card">
        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : specialties.length === 0 ? (
          <div className="empty-state">Aucune spécialité.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialties.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.description || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => openEdit(s)} title="Modifier">✏️</button>
                      <button className="icon-btn danger" onClick={() => handleDelete(s)} title="Supprimer">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? 'Modifier' : 'Nouvelle'} spécialité</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                className="form-input"
                placeholder="Nom (ex: Cardiologie)"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="form-input"
                placeholder="Description (optionnel)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {error && <span className="form-error">{error}</span>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary">{editing ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
{showDeleteModal && specialtyToDelete && (
  <div className="modal-overlay">
    <div className="delete-modal">
      <h3>Supprimer la spécialité</h3>

      <p>
        Voulez-vous vraiment supprimer la spécialité
        <strong> "{specialtyToDelete.name}"</strong> ?
      </p>

      <p className="warning-text">
        Cette action est irréversible.
      </p>

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => {
            setShowDeleteModal(false);
            setSpecialtyToDelete(null);
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