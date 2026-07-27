import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import type { AppNotification, NotificationType } from '../types';

// ─── Badge colors by type ───────────────────────────────────────────────────
const TYPE_META: Record<
  NotificationType,
  { label: string; badgeBg: string; badgeColor: string }
> = {
  CONFIRMATION:   { label: 'CONFIRMATION',    badgeBg: 'rgba(14,159,142,0.13)', badgeColor: '#0a8a7b' },
  RAPPEL:         { label: 'RAPPEL',          badgeBg: 'rgba(107,90,205,0.13)', badgeColor: '#6B5ACD' },
  MODIFICATION:   { label: 'MODIFICATION',    badgeBg: 'rgba(243,156,18,0.14)', badgeColor: '#d97706' },
  ANNULATION:     { label: 'ANNULATION',      badgeBg: 'rgba(214,59,59,0.13)',  badgeColor: '#D63B3B' },
  INFO:           { label: 'INFO',            badgeBg: 'rgba(27,79,114,0.12)',  badgeColor: '#1B4F72' },
  NOUVEAU_PATIENT:{ label: 'NOUVEAU PATIENT', badgeBg: 'rgba(5,150,105,0.13)',  badgeColor: '#059669' },
  NOUVEL_AJOUT:   { label: 'NOUVEL AJOUT',    badgeBg: 'rgba(37,99,235,0.13)',  badgeColor: '#2563eb' },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from backend
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = useCallback(
    async (id: string | number) => {
      try {
        await markNotificationRead(id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="notif-page">
        {/* ── Header ── */}
        <div className="notif-page-header">
          <div>
            <span className="notif-page-eyebrow">ALERTES</span>
            <h1 className="notif-page-title">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button className="notif-page-mark-all" onClick={markAllRead}>
              Tout marquer comme lu ({unreadCount})
            </button>
          )}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="notif-page-empty">Chargement…</div>
        ) : notifications.length === 0 ? (
          <div className="notif-page-empty">Chargement…</div>
        ) : (
          <div className="notif-page-list">
            {notifications.map((n) => {
              const isRead = n.isRead;
              const type = n.type ?? 'INFO';
              const meta = TYPE_META[type];

              return (
                <div
                  key={n.id}
                  className={`notif-page-card${isRead ? '' : ' notif-page-card--unread'}`}
                  onClick={() => !isRead && markRead(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && !isRead && markRead(n.id)}
                >
                  {/* Left icon */}
                  <div
                    className="notif-page-card-icon"
                    style={{ background: n.iconBg }}
                  >
                    {n.icon}
                  </div>

                  {/* Body */}
                  <div className="notif-page-card-body">
                    <span
                      className="notif-page-badge"
                      style={{
                        background: meta.badgeBg,
                        color: meta.badgeColor,
                      }}
                    >
                      {meta.label}
                    </span>
                    <p className="notif-page-card-title">{n.title}</p>
                    <span className="notif-page-card-sub">{n.subtitle}</span>
                  </div>

                  {/* Right meta */}
                  <div className="notif-page-card-meta">
                    <span className={`notif-page-card-time${isRead ? '' : ' notif-page-card-time--active'}`}>
                      {n.time}
                    </span>
                    {!isRead && <span className="notif-page-dot" aria-label="Non lu" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
