import api from './axios';
import { adminDashboardApi } from './adminDashboard';
import type { AppNotification, UserRole } from '../types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

export async function fetchNotificationsForRole(role: UserRole): Promise<AppNotification[]> {
  if (role === 'admin') {
    const res = await adminDashboardApi.stats();
    return res.data.recent_users.map((u) => ({
      id: u.id,
      icon: '👤',
      iconBg: 'var(--accent-bg)',
      title: `${u.first_name} ${u.last_name} a rejoint MedPlanner`,
      subtitle: u.role === 'doctor' ? 'Nouveau médecin' : u.role === 'secretary' ? 'Nouvelle secrétaire' : 'Nouveau patient',
      time: timeAgo(u.created_at),
    }));
  }

  if (role === 'patient') {
    // Placeholder en attendant le module rendez-vous : structure prête à brancher
    return [
      {
        id: 'welcome',
        icon: '👋',
        iconBg: 'var(--accent-bg)',
        title: 'Bienvenue sur MedPlanner',
        subtitle: 'Réservez votre premier rendez-vous',
        time: 'Maintenant',
      },
    ];
  }

  if (role === 'doctor') {
    return [
      {
        id: 'welcome',
        icon: '🩺',
        iconBg: 'var(--lilac-bg)',
        title: 'Votre profil est actif',
        subtitle: 'Les patients peuvent vous trouver',
        time: 'Maintenant',
      },
    ];
  }

  if (role === 'secretary') {
    return [
      {
        id: 'welcome',
        icon: '📋',
        iconBg: 'var(--success-bg)',
        title: 'Compte secrétaire activé',
        subtitle: 'Gérez le planning de votre médecin',
        time: 'Maintenant',
      },
    ];
  }

  return [];
}