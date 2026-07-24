import api from './axios';
import type { AppNotification, NotificationType } from '../types';

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days}j`;
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Interface for backend notification response
interface BackendNotification {
  id: number;
  user_id: number;
  appointment_id: number | null;
  type: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  icon_bg: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const response = await api.get<BackendNotification[]>('/notifications');
  return response.data.map((n) => ({
    id: n.id,
    icon: n.icon || '🔔',
    iconBg: n.icon_bg || '#EBF4F8',
    title: n.title,
    subtitle: n.subtitle || '',
    time: timeAgo(n.created_at),
    type: n.type as NotificationType,
    isRead: n.read_at !== null,
  }));
}

export async function markNotificationRead(id: string | number): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}