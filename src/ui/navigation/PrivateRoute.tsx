import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../shared/constants';
import { isTokenExpired, clearAuthStorage } from '../../shared/utils/authUtils';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user, token } = useAuth();

  const isInvalidSession = !isAuthenticated || !token || !user || isTokenExpired(token);

  if (isInvalidSession) {
    clearAuthStorage();
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.nombrerol)) {
    // Redirección por defecto según el rol del usuario
    let defaultRoute: string = ROUTES.DASHBOARD;
    if (user.nombrerol === 'TAQUILLERO') {
      defaultRoute = ROUTES.TAQUILLA;
    } else if (user.nombrerol === 'EMPLEADO_ENCOMIENDAS') {
      defaultRoute = ROUTES.ENCOMIENDAS;
    }
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};
