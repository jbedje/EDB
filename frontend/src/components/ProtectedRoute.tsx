import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

/**
 * Protected Route Component with Role-Based Access Control
 *
 * @param children - The component to render if authorized
 * @param allowedRoles - Array of roles allowed to access this route (optional)
 * @param requireAuth - Whether authentication is required (default: true)
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    // Reset error state when location changes
    setHasShownError(false);
  }, [location.pathname]);

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    if (!hasShownError) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      setHasShownError(true);
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.includes(user.role);

    if (!hasPermission) {
      if (!hasShownError) {
        toast.error('Vous n\'avez pas les permissions nécessaires pour accéder à cette page');
        setHasShownError(true);
      }

      // Redirect based on user role
      const redirectPath = user.role === 'ADMIN'
        ? '/app'
        : user.role === 'COACH'
        ? '/app/mes-cohortes'
        : '/app';

      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
}
