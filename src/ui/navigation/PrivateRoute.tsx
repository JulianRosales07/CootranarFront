import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../shared/constants';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.nombrerol)) {
    // Redirección por defecto según el rol del usuario
    const defaultRoute = user.nombrerol === 'TAQUILLERO' ? ROUTES.TAQUILLA : ROUTES.DASHBOARD;
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};
