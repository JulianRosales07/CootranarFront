import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { TiquetesPage } from '../pages/tiquetes/TiquetesPage';
import { EncomiendaPage } from '../pages/encomiendas/EncomiendaPage';
import { AgenciasPage } from '../pages/agencias/AgenciasPage';
import { AseguradorasPage } from '../pages/aseguradoras/AseguradorasPage';
import { CiudadesPage } from '../pages/ciudades/CiudadesPage';
import { ConductoresPage } from '../pages/conductores/ConductoresPage';
import { OficinasPage } from '../pages/oficinas/OficinasPage';
import { PolizasPage } from '../pages/polizas/PolizasPage';
import { VehiculosPage } from '../pages/vehiculos/VehiculosPage';
import { ViajesPage } from '../pages/viajes/ViajesPage';
import { TiposServicioPage } from '../pages/tipos-servicio/TiposServicioPage';
import { TiposBusPage } from '../pages/tipos-bus/TiposBusPage';
import { RutasPage } from '../pages/rutas/RutasPage';
import { TaquillerosPage } from '../pages/empleados/TaquillerosPage';
import { EmpleadosEncomiendasPage } from '../pages/empleados/EmpleadosEncomiendasPage';
import { PrivateRoute } from './PrivateRoute';
import { ROUTES } from '../../shared/constants';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        
        <Route element={<PrivateRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TIQUETES} element={<TiquetesPage />} />
          <Route path={ROUTES.ENCOMIENDAS} element={<EncomiendaPage />} />
          <Route path={ROUTES.RUTAS} element={<RutasPage />} />
          <Route path={ROUTES.AGENCIAS} element={<AgenciasPage />} />
          <Route path={ROUTES.ASEGURADORAS} element={<AseguradorasPage />} />
          <Route path={ROUTES.CIUDADES} element={<CiudadesPage />} />
          <Route path={ROUTES.CONDUCTORES} element={<ConductoresPage />} />
          <Route path={ROUTES.OFICINAS} element={<OficinasPage />} />
          <Route path={ROUTES.POLIZAS} element={<PolizasPage />} />
          <Route path={ROUTES.VEHICULOS} element={<VehiculosPage />} />
          <Route path={ROUTES.VIAJES} element={<ViajesPage />} />
          <Route path={ROUTES.TIPOS_SERVICIO} element={<TiposServicioPage />} />
          <Route path={ROUTES.TIPOS_BUS} element={<TiposBusPage />} />
          <Route path={ROUTES.TAQUILLEROS} element={<TaquillerosPage />} />
          <Route path={ROUTES.EMPLEADOS_ENCOMIENDAS} element={<EmpleadosEncomiendasPage />} />
        </Route>

        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
