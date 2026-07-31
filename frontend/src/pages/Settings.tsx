import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useSearchParams } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import type { AppNotification, NotificationType } from '../types';

type Tab = 'account' | 'notifications' | 'security';


const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Médecin',
  secretary: 'Secrétaire',
  admin: 'Admin',
};

const TYPE_META: Record<NotificationType, { label: string; badgeBg: string; badgeColor: string }> = {
  CONFIRMATION:    { label: 'CONFIRMATION',    badgeBg: 'rgba(14,159,142,0.13)', badgeColor: '#0a8a7b' },
  RAPPEL:          { label: 'RAPPEL',          badgeBg: 'rgba(107,90,205,0.13)', badgeColor: '#6B5ACD' },
  MODIFICATION:    { label: 'MODIFICATION',    badgeBg: 'rgba(243,156,18,0.14)', badgeColor: '#d97706' },
  ANNULATION:      { label: 'ANNULATION',      badgeBg: 'rgba(214,59,59,0.13)',  badgeColor: '#D63B3B' },
  INFO:            { label: 'INFO',            badgeBg: 'rgba(27,79,114,0.12)',  badgeColor: '#1B4F72' },
  NOUVEAU_PATIENT: { label: 'NOUVEAU PATIENT', badgeBg: 'rgba(5,150,105,0.13)',  badgeColor: '#059669' },
  NOUVEL_AJOUT:    { label: 'NOUVEL AJOUT',    badgeBg: 'rgba(37,99,235,0.13)',  badgeColor: '#2563eb' },
};



export default function Settings() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as Tab | null;

  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab === 'notifications' ? 'notifications' : 'account'
  );
  const { user, refreshUser } = useAuth();

  // ── Notifications state (toutes les hooks AVANT le return conditionnel) ──
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Charge les notifications depuis le backend
  useEffect(() => {
    if (activeTab === 'notifications' && user) {
      fetchNotifications().then(setNotifications);
    }
  }, [activeTab, user]);

  const markRead = useCallback(async (id: string | number) => {
    if (!user) return;
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n));
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true })));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Guard après toutes les hooks ────────────────────────────────────────
  if (!user) return null;

  const initials   = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
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
        {/* ── Onglets de navigation ── */}
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
            {unreadCount > 0 && (
              <span className="settings-notif-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="settings-tab-icon">🛡️</span> Sécurité
          </button>
        </div>

        {/* ── Contenu ── */}
        <div className="settings-content">

          {/* ── Onglet Compte ── */}
          {activeTab === 'account' && (
            <AccountTab
              user={user}
              initials={initials}
              memberSince={memberSince}
              onUpdated={(u) => refreshUser(u)}
            />
          )}

          {/* ── Onglet Sécurité ── */}
          {activeTab === 'security' && <SecurityTab />}

          {/* ── Onglet Notifications (même design que le topbar/page dédiée) ── */}
          {activeTab === 'notifications' && (
            <div>
              {/* Header de la section */}
              <div className="notif-settings-header">
                <div>
                  <span className="notif-page-eyebrow">ALERTES</span>
                  <h2 className="settings-content-title" style={{ margin: 0 }}>Notifications</h2>
                </div>
                {unreadCount > 0 && (
                  <button className="notif-page-mark-all" onClick={markAllRead}>
                    Tout marquer comme lu ({unreadCount})
                  </button>
                )}
              </div>

              {/* Liste */}
              {notifications.length === 0 ? (
                <div className="notif-page-empty">Chargement…</div>
              ) : (
                <div className="notif-page-list">
                  {notifications.map((n) => {
                    const isRead = n.isRead;
                    const type   = n.type ?? 'INFO';
                    const meta   = TYPE_META[type];

                    return (
                      <div
                        key={n.id}
                        className={`notif-page-card${isRead ? '' : ' notif-page-card--unread'}`}
                        onClick={() => !isRead && markRead(n.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && !isRead && markRead(n.id)}
                      >
                        {/* Icône */}
                        <div
                          className="notif-page-card-icon"
                          style={{ background: n.iconBg }}
                        >
                          {n.icon}
                        </div>

                        {/* Corps */}
                        <div className="notif-page-card-body">
                          <span
                            className="notif-page-badge"
                            style={{ background: meta.badgeBg, color: meta.badgeColor }}
                          >
                            {meta.label}
                          </span>
                          <p className="notif-page-card-title">{n.title}</p>
                          <span className="notif-page-card-sub">{n.subtitle}</span>
                        </div>

                        {/* Méta (heure + point non-lu) */}
                        <div className="notif-page-card-meta">
                          <span className="notif-page-card-time">{n.time}</span>
                          {!isRead && <span className="notif-page-dot" aria-label="Non lu" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
