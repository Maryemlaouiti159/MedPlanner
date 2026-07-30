import type { UserRole } from '../types';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Tableau de bord', path: '/dashboard', icon: '📊' },
    { label: 'Rendez-vous', path: '/admin/appointments', icon: '📅' },
    { label: 'Utilisateurs', path: '/admin/users', icon: '👥' },
    { label: 'Médecins', path: '/admin/doctors', icon: '🩺' },
    { label: 'Secrétaires', path: '/admin/secretaries', icon: '📋' },
    { label: 'Spécialités', path: '/admin/specialties', icon: '🏷️' },
    { label: 'Paramètres', path: '/settings', icon: '⚙️' },
  ],
  patient: [
    { label: 'Tableau de bord', path: '/dashboard', icon: '📊' },
    { label: 'Rendez-vous', path: '/appointments', icon: '📅' },
    { label: 'Médecins', path: '/doctors', icon: '🩺' },
    { label: 'Paramètres', path: '/settings', icon: '⚙️' },
  ],
  doctor: [
    { label: 'Tableau de bord', path: '/dashboard', icon: '📊' },
    { label: 'Planning', path: '/planning', icon: '📅' },
    { label: 'Patients', path: '/patients', icon: '👥' },
    { label: 'Disponibilités', path: '/availabilities', icon: '🕒' },
    { label: 'Paramètres', path: '/settings', icon: '⚙️' },
  ],
  secretary: [
    { label: 'Tableau de bord', path: '/dashboard', icon: '📊' },
    { label: 'Rendez-vous',     path: "/secretary/appointments", icon: '📅' },
    { label: 'Patients', path: '/secretary/patients', icon: '👥' },
    { label: 'Paramètres', path: '/settings', icon: '⚙️' },
  ],
};