import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log("Utilisateur connecté :", user);
  console.log("Rôles autorisés :", allowedRoles);

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("Accès refusé. Role actuel :", user.role);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;

}