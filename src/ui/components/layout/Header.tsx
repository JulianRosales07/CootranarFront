import React from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';

const getPageHeaderInfo = (pathname: string) => {
  switch (pathname) {
    case ROUTES.TIPOS_BUS:
      return {
        title: 'Gestión de Tipos de Bus',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Tipos de Bus</span>
          </>
        ),
      };
    case ROUTES.ASEGURADORAS:
      return {
        title: 'Gestión de Aseguradoras',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Aseguradoras</span>
          </>
        ),
      };
    case ROUTES.VEHICULOS:
      return {
        title: 'Gestión de Vehículos',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Vehículos</span>
          </>
        ),
      };
    case ROUTES.CONDUCTORES:
      return {
        title: 'Gestión de Conductores',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Conductores</span>
          </>
        ),
      };
    case ROUTES.RUTAS:
      return {
        title: 'Gestión de Rutas',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Rutas</span>
          </>
        ),
      };
    case ROUTES.AGENCIAS:
      return {
        title: 'Gestión de Agencias',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Agencias</span>
          </>
        ),
      };
    case ROUTES.OFICINAS:
      return {
        title: 'Gestión de Oficinas',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Oficinas</span>
          </>
        ),
      };
    case ROUTES.CIUDADES:
      return {
        title: 'Gestión de Ciudades',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Ciudades</span>
          </>
        ),
      };
    case ROUTES.POLIZAS:
      return {
        title: 'Gestión de Pólizas',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Pólizas</span>
          </>
        ),
      };
    case ROUTES.VIAJES:
      return {
        title: 'Gestión de Viajes',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Viajes</span>
          </>
        ),
      };
    case ROUTES.TIQUETES:
      return {
        title: 'Gestión de Tiquetes',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Tiquetes</span>
          </>
        ),
      };
    case ROUTES.ENCOMIENDAS:
      return {
        title: 'Gestión de Encomiendas',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Encomiendas</span>
          </>
        ),
      };
    case ROUTES.TIPOS_SERVICIO:
      return {
        title: 'Gestión de Tipos de Servicio',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Tipos de Servicio</span>
          </>
        ),
      };
    case ROUTES.TAQUILLEROS:
      return {
        title: 'Gestión de Taquilleros',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Empleados &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Taquilleros</span>
          </>
        ),
      };
    case ROUTES.EMPLEADOS_ENCOMIENDAS:
      return {
        title: 'Empleados de Encomiendas',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Empleados &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Encomiendas</span>
          </>
        ),
      };
    case ROUTES.USUARIOS:
      return {
        title: 'Gestión de Usuarios',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Usuarios</span>
          </>
        ),
      };
    case ROUTES.OFICINAS_ENCOMIENDAS:
      return {
        title: 'Oficinas de Encomiendas',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Encomiendas &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Oficinas</span>
          </>
        ),
      };
    case ROUTES.TARIFAS_RUTA:
      return {
        title: 'Tarifas de Ruta',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Operaciones &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Tarifas</span>
          </>
        ),
      };
    case ROUTES.DEPARTAMENTOS:
      return {
        title: 'Departamentos',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Gestión Base &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Departamentos</span>
          </>
        ),
      };
    default:
      return {
        title: 'Panel Principal',
        breadcrumbs: (
          <>
            Inicio &rsaquo; <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Dashboard</span>
          </>
        ),
      };
  }
};

export const Header = () => {
  const location = useLocation();
  const { title, breadcrumbs } = getPageHeaderInfo(location.pathname);

  return (
    <header
      style={{
        height: '76px',
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* ── Left: Title and Breadcrumbs ─────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
          {breadcrumbs}
        </p>
      </div>

      {/* ── Right: Actions ───────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notifications */}
        <button
          style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#64748b',
            position: 'relative',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            notifications
          </span>
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ef4444',
            }}
          />
        </button>

        {/* Settings */}
        <button
          style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            settings
          </span>
        </button>
      </div>
    </header>
  );
};
