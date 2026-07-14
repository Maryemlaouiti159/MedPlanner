import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

type Tab = 'account' | 'notifications' | 'security' | 'privacy';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  secretary: 'Secrétaire',
  admin: 'Admin',
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const { user, refreshUser } = useAuth();

  if (!user) return null;

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  const memberSince = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(
    new Date(user.created_at)
  );

  return (
    <DashboardLayout>
      <div className="settings-page-header">
        <h1 className="settings-page-title">Paramètres</h1>
        <p className="settings-page-subtitle">Gérez vos préférences et informations personnelles</p>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span className="settings-tab-icon">👤</span> Compte
          </button>
          <button
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="settings-tab-icon">🔔</span> Notifications
          </button>
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="settings-tab-icon">🛡️</span> Sécurité
          </button>
        
        </div>

        <div className="settings-content">
          {activeTab === 'account' && (
            <AccountTab
              user={user}
              initials={initials}
              memberSince={memberSince}
              onUpdated={(u) => refreshUser(u)}
            />
          )}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && (
            <div className="settings-placeholder">Réglages de notifications à venir.</div>
          )}
          
        </div>
      </div>
    </DashboardLayout>
  );
}

// ===== Onglet Compte =====

function AccountTab({
  user,
  initials,
  memberSince,
  onUpdated,
}: {
  user: any;
  initials: string;
  memberSince: string;
  onUpdated: (u: any) => void;
}) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSuccess(false);
    try {
      const res = await api.put('/profile', form);
      onUpdated(res.data);
      setSuccess(true);
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? { general: [err.response?.data?.message ?? 'Erreur inconnue'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="settings-content-title">Informations personnelles</h2>
      <p className="settings-content-subtitle">Mettez à jour vos informations de profil</p>
      <hr className="settings-divider" />

      <div className="settings-profile-banner">
        <div className="settings-profile-info">
          <div className="settings-avatar">{initials}</div>
          <div>
            <div className="settings-profile-name">{user.first_name} {user.last_name}</div>
            <div className="settings-profile-meta">
              {ROLE_LABELS[user.role] ?? user.role} · Membre depuis {memberSince}
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
  );
}

// ===== Onglet Sécurité =====

function SecurityTab() {
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSuccess(false);
    try {
      await api.put('/password', form);
      setForm({ current_password: '', password: '', password_confirmation: '' });
      setSuccess(true);
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? { general: [err.response?.data?.message ?? 'Erreur inconnue'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="settings-content-title">Mot de passe</h2>
      <p className="settings-content-subtitle">Choisissez un mot de passe fort que vous n'utilisez sur aucun autre site</p>
      <hr className="settings-divider" />

      {success && <div className="settings-success-banner">Mot de passe modifié avec succès.</div>}

      <form onSubmit={handleSubmit}>
        <div className="settings-form-grid single">
          <div className="settings-field">
            <label>Mot de passe actuel</label>
            <input
              className="settings-input"
              type="password"
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              required
            />
            {errors.current_password && <span className="settings-error">{errors.current_password[0]}</span>}
          </div>
          <div className="settings-field">
            <label>Nouveau mot de passe</label>
            <input
              className="settings-input"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {errors.password && <span className="settings-error">{errors.password[0]}</span>}
          </div>
          <div className="settings-field">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              className="settings-input"
              type="password"
              minLength={8}
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              required
            />
          </div>
        </div>

        {errors.general && <span className="settings-error">{errors.general[0]}</span>}

        <div className="settings-actions">
          <button type="submit" className="settings-btn-primary" disabled={submitting}>
            {submitting ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
}