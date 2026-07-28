import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
// import { profileApi } from '../../api/profileApi';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  secretary: 'Secrétaire',
  admin: 'Admin',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setUser(currentUser);

    setForm({
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      email: currentUser.email,
      phone: currentUser.phone ?? '',
    });

    setLoading(false);
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setErrors({});
    setSuccess(false);

    try {
      // Remplace cette ligne par ton appel API
      // const res = await profileApi.update(form);

      // setUser(res.data);

      setUser({
        ...user!,
        ...form,
      });

      setSuccess(true);
    } catch (err: any) {
      setErrors(
        err.response?.data?.errors ?? {
          general: [err.response?.data?.message ?? 'Erreur inconnue'],
        }
      );
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="empty-state">Utilisateur introuvable.</div>
      </DashboardLayout>
    );
  }

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  const memberSince = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(user.created_at));

  return (
    <DashboardLayout>
      <div
        className="settings-page-header"
        style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
      >
        <button className="profile-back" onClick={() => navigate(-1)}>
          ←
        </button>

        <div>
          <h1 className="settings-page-title">Mon profil</h1>

          <p className="settings-page-subtitle">
            Consultez et modifiez vos informations
          </p>
        </div>
      </div>

      <div
        className="settings-layout"
        style={{ gridTemplateColumns: '1fr' }}
      >
        <div className="settings-content">
          <div className="settings-profile-banner">
            <div className="settings-profile-info">
              <div className="settings-avatar">{initials}</div>

              <div>
                <div className="settings-profile-name">
                  {user.first_name} {user.last_name}
                </div>

                <div className="settings-profile-meta">
                  {ROLE_LABELS[user.role]}

                  {' · '}

                  Membre depuis {memberSince}

                  {' · '}

                  <span
                    style={{
                      color: user.is_active
                        ? 'var(--success)'
                        : 'var(--danger)',
                    }}
                  >
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {success && (
            <div className="settings-success-banner">
              Profil mis à jour avec succès.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="settings-form-grid">
              <div className="settings-field">
                <label>Prénom</label>

                <input
                  className="settings-input"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="settings-field">
                <label>Nom</label>

                <input
                  className="settings-input"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="settings-field">
                <label>Email</label>

                <input
                  type="email"
                  className="settings-input"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                {errors.email && (
                  <span className="settings-error">
                    {errors.email[0]}
                  </span>
                )}
              </div>

              <div className="settings-field">
                <label>Téléphone</label>

                <input
                  className="settings-input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />

                {errors.phone && (
                  <span className="settings-error">
                    {errors.phone[0]}
                  </span>
                )}
              </div>
            </div>

            {errors.general && (
              <span className="settings-error">
                {errors.general[0]}
              </span>
            )}

            <div className="settings-actions">
              <button
                className="settings-btn-primary"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? 'Enregistrement...'
                  : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}