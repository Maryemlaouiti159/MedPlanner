import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { specialtiesApi, type SpecialtyWithCounts } from '../../api/specialties';

const specialtyIcons: Record<string, string> = {
  'Cardiologie': '🖤',
  'Pédiatrie': '🫀',
  'Orthopédie': '🦴',
  'Dermatologie': '🔬',
  'Neurologie': '🧠',
  'Ophtalmologie': '👁️',
  'Médecine générale': '👨‍⚕️',
  'Gynécologie': '👩‍⚕️',
  'Psychiatrie': '🧑‍💻',
  'ORL': '👂',
  'Radiologie': '📷',
  'Dentisterie': '🦷',
};

export default function SpecialtiesList() {
  const [specialties, setSpecialties] = useState<SpecialtyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpecialtyWithCounts | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<SpecialtyWithCounts | null>(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await specialtiesApi.listAdmin();
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

  const openEdit = (s: SpecialtyWithCounts) => {
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

  const handleDelete = (s: SpecialtyWithCounts) => {
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
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0' }}>
              Spécialités médicales
            </h1>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
              Gérer les spécialités et leurs médecins associés
            </p>
          </div>
          <button
            onClick={openCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              background: '#2563eb',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            Ajouter une spécialité
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
        ) : specialties.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>Aucune spécialité.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {specialties.map((s) => (
              <div
                key={s.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>
                  {specialtyIcons[s.name] || '🏥'}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#1f2937', margin: '0 0 20px 0' }}>{s.name}</h3>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>{s.doctors_count}</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>Médecins</div>
                  </div>
                  <div style={{ width: '1px', background: '#e5e7eb' }}></div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>{s.slots_count}</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>Créneaux</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => openEdit(s)}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      color: '#4b5563',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #fee2e2',
                      background: '#fef2f2',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowForm(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 20px 0' }}>
                {editing ? 'Modifier' : 'Nouvelle'} spécialité
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  placeholder="Nom (ex: Cardiologie)"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                  }}
                />
                <textarea
                  placeholder="Description (optionnel)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                />
                {error && <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      color: '#4b5563',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#2563eb',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {editing ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && specialtyToDelete && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px 0' }}>
                Supprimer la spécialité
              </h3>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 8px 0' }}>
                Voulez-vous vraiment supprimer la spécialité <strong>"{specialtyToDelete.name}"</strong> ?
              </p>
              <p style={{ fontSize: '14px', color: '#ef4444', margin: '0 0 20px 0' }}>
                Cette action est irréversible.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSpecialtyToDelete(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#4b5563',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
