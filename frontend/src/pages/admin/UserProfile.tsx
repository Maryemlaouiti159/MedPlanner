import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminUsersApi } from '../../api/adminUsers';
import type { User } from '../../types';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  secretary: 'Secrétaire',
  admin: 'Admin',
};

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    adminUsersApi.show(Number(id))
      .then((res) => {
        setUser(res.data);
        setForm({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone: res.data.phone ?? '',
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setErrors({});
    setSuccess(false);

    try {
      const res = await adminUsersApi.update(Number(id), form);
      setUser(res.data);
      setSuccess(true);
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? { general: [err.response?.data?.message ?? 'Erreur inconnue'] });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-state">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (notFound || !user) {
    return (
      <DashboardLayout>
        <div className="empty-state">Utilisateur introuvable.</div>
      </DashboardLayout>
    );
  }

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  const memberSince = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(
    new Date(user.created_at)
  );

  return (
    <DashboardLayout>
      <div className="settings-page-header" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button className="profile-back" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="settings-page-title">Profil utilisateur</h1>
          <p className="settings-page-subtitle">Consultez et modifiez les informations de ce compte</p>
        </div>
      </div>

      <div className="settings-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="settings-content">
          <div className="settings-profile-banner">
            <div className="settings-profile-info">
              <div className="settings-avatar">{initials}</div>
              <div>
                <div className="settings-profile-name">{user.first_name} {user.last_name}</div>
                <div className="settings-profile-meta">
                  {ROLE_LABELS[user.role] ?? user.role} · Membre depuis {memberSince}
                  {' · '}
                  <span style={{ color: user.is_active ? 'var(--success)' : 'var(--danger)' }}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {success && <div className="settings-success-banner">Profil mis à jour avec succès.</div>}

          <form onSubmit={handleSubmit}>
            <div className="settings-form-grid">
              <div className="settings-field">
                <label>Prénom</label>
                <input
                  className="settings-input"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="settings-field">
                <label>Nom</label>
                <input
                  className="settings-input"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="settings-field">
                <label>Email</label>
                <input
                  className="settings-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                {errors.email && <span className="settings-error">{errors.email[0]}</span>}
              </div>
              <div className="settings-field">
                <label>Téléphone</label>
                <input
                  className="settings-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {errors.general && <span className="settings-error">{errors.general[0]}</span>}

            <div className="settings-actions">
              <button type="submit" className="settings-btn-primary" disabled={submitting}>
                {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}