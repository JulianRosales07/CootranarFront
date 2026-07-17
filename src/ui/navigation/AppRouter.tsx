import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { TiquetesPage } from '../pages/tiquetes/TiquetesPage';
import { TaquillaPage } from '../pages/taquilla/TaquillaPage';
import { EncomiendaPage } from '../pages/encomiendas/EncomiendaPage';
import { DespachosPage } from '../pages/despachos/DespachosPage';
import { GestionTiquetesPage } from '../pages/viajes/GestionTiquetesPage';
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
import { TarifasRutaPage } from '../pages/rutas/TarifasRutaPage';
import { ConfiguracionMasivaTarifasPage } from '../pages/rutas/ConfiguracionMasivaTarifasPage';
import { TaquillerosPage } from '../pages/empleados/TaquillerosPage';
import { EmpleadosEncomiendasPage } from '../pages/empleados/EmpleadosEncomiendasPage';
import { OficinasEncomiendasPage } from '../pages/oficinas-encomiendas/OficinasEncomiendasPage';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { PrivateRoute } from './PrivateRoute';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ROUTES } from '../../shared/constants';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          
          {/* Rutas compartidas (Administrador y Taquillero) */}
          <Route element={<PrivateRoute allowedRoles={['ADMINISTRADOR', 'TAQUILLERO']} />}>
            <Route path={ROUTES.TAQUILLA} element={<TaquillaPage />} />
            <Route path={ROUTES.VIAJES} element={<ViajesPage />} />
            <Route path={ROUTES.GESTION_TIQUETES} element={<GestionTiquetesPage />} />
          </Route>

          {/* Rutas de Encomiendas (Administrador y Empleado de Encomiendas) */}
          <Route element={<PrivateRoute allowedRoles={['ADMINISTRADOR', 'EMPLEADO_ENCOMIENDAS']} />}>
            <Route path={ROUTES.ENCOMIENDAS} element={<EncomiendaPage />} />
            <Route path={ROUTES.DESPACHOS} element={<DespachosPage />} />
            <Route path={ROUTES.EMPLEADOS_ENCOMIENDAS} element={<EmpleadosEncomiendasPage />} />
            <Route path={ROUTES.OFICINAS_ENCOMIENDAS} element={<OficinasEncomiendasPage />} />
          </Route>

          {/* Rutas exclusivas del Administrador */}
          <Route element={<PrivateRoute allowedRoles={['ADMINISTRADOR']} />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.TIQUETES} element={<TiquetesPage />} />
            <Route path={ROUTES.RUTAS} element={<RutasPage />} />
            <Route path="/rutas/:idruta/tarifas" element={<TarifasRutaPage />} />
            <Route path="/rutas/:idruta/tarifas-masivas" element={<ConfiguracionMasivaTarifasPage />} />
            <Route path={ROUTES.AGENCIAS} element={<AgenciasPage />} />
            <Route path={ROUTES.ASEGURADORAS} element={<AseguradorasPage />} />
            <Route path={ROUTES.CIUDADES} element={<CiudadesPage />} />
            <Route path={ROUTES.CONDUCTORES} element={<ConductoresPage />} />
            <Route path={ROUTES.OFICINAS} element={<OficinasPage />} />
            <Route path={ROUTES.POLIZAS} element={<PolizasPage />} />
            <Route path={ROUTES.VEHICULOS} element={<VehiculosPage />} />
            <Route path={ROUTES.TIPOS_SERVICIO} element={<TiposServicioPage />} />
            <Route path={ROUTES.TIPOS_BUS} element={<TiposBusPage />} />
            <Route path={ROUTES.TAQUILLEROS} element={<TaquillerosPage />} />
            <Route path={ROUTES.USUARIOS} element={<UsuariosPage />} />
          </Route>

          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
