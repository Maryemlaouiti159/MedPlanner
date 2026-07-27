import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { specialtiesApi, type SpecialtyWithCounts } from '../../api/specialties';

// Icône par défaut si aucune n'est renseignée en base (ancienne donnée, etc.)
const DEFAULT_ICON = '🏥';

// Suggestions rapides proposées dans le formulaire (l'admin peut aussi taper
// n'importe quel autre emoji à la main).
const iconSuggestions = [
  '🏥', '🫀', '🧒', '🦴', '🔬', '🧠', '👁️', '👨‍⚕️', '👩‍⚕️', '🧑‍💻',
  '👂', '📷', '🦷', '🩺', '🍽️', '🫁', '⚗️', '🦵', '🌿', '🔪',
  '💉', '🥗', '🏃', '🚑', '🎗️', '👴',
];

type DoctorFilter = 'all' | 'with_doctors' | 'without_doctors';

const doctorFilters: { label: string; value: DoctorFilter }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Avec médecins', value: 'with_doctors' },
  { label: 'Sans médecins', value: 'without_doctors' },
];

export default function SpecialtiesList() {
  const [specialties, setSpecialties] = useState<SpecialtyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpecialtyWithCounts | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: DEFAULT_ICON });
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<SpecialtyWithCounts | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<DoctorFilter>('all');

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
    setForm({ name: '', description: '', icon: DEFAULT_ICON });
    setError('');
    setShowForm(true);
  };

  const openEdit = (s: SpecialtyWithCounts) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description ?? '', icon: s.icon || DEFAULT_ICON });
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

  const filteredSpecialties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return specialties.filter((s) => {
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        (s.description ?? '').toLowerCase().includes(term);

      const matchesFilter =
        doctorFilter === 'all' ||
        (doctorFilter === 'with_doctors' && s.doctors_count > 0) ||
        (doctorFilter === 'without_doctors' && s.doctors_count === 0);

      return matchesSearch && matchesFilter;
    });
  }, [specialties, searchTerm, doctorFilter]);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '24px', flexWrap: 'wrap' }}>
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
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            Ajouter une spécialité
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#f9fafb', padding: '6px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            {doctorFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDoctorFilter(filter.value)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: doctorFilter === filter.value ? 'white' : 'transparent',
                  color: doctorFilter === filter.value ? '#1f2937' : '#9ca3af',
                  cursor: 'pointer',
                  boxShadow: doctorFilter === filter.value ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Rechercher une spécialité..."
            aria-label="Rechercher une spécialité"
            style={{
              width: '320px',
              maxWidth: '100%',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              outline: 'none',
              fontSize: '15px',
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
        ) : filteredSpecialties.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>
            {specialties.length === 0 ? (
              'Aucune spécialité.'
            ) : (
              <>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                Aucune spécialité ne correspond à votre recherche.
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {filteredSpecialties.map((s) => (
              <div
                key={s.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>
                  {s.icon || DEFAULT_ICON}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#1f2937', margin: '0 0 8px 0' }}>{s.name}</h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: s.description ? '#6b7280' : '#c1c7d0',
                    lineHeight: '20px',
                    margin: '0 0 20px 0',
                    fontStyle: s.description ? 'normal' : 'italic',
                    flexGrow: 1,
                  }}
                >
                  {s.description || 'Aucune description'}
                </p>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>{s.doctors_count}</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>Médecins</div>
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
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      flexShrink: 0,
                    }}
                  >
                    {form.icon || DEFAULT_ICON}
                  </div>
                  <input
                    placeholder="Emoji (ex: 🫀)"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    maxLength={4}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      fontSize: '18px',
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {iconSuggestions.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setForm({ ...form, icon })}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        border: form.icon === icon ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        background: form.icon === icon ? '#eff6ff' : '#fff',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

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
