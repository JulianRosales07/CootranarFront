import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../hooks/useAuth';

interface NotificacionItem {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  icono: string;
  color: string;
  leido: boolean;
}

const NOTIFICACIONES_INICIALES: NotificacionItem[] = [
  {
    id: '1',
    titulo: 'Nuevo despacho programado',
    descripcion: 'Pasto → Cali · Móvil 1888 · 14:00',
    tiempo: 'Hace 10 min',
    icono: 'departure_board',
    color: '#3b82f6',
    leido: false,
  },
  {
    id: '2',
    titulo: 'Tiquete emitido en taquilla',
    descripcion: 'Asiento 14 · Pasajero Juan Pérez',
    tiempo: 'Hace 25 min',
    icono: 'confirmation_number',
    color: '#10b981',
    leido: false,
  },
  {
    id: '3',
    titulo: 'Guía de encomienda entregada',
    descripcion: 'Guía #00284 entregada en Agencia Ipiales',
    tiempo: 'Hace 1 hora',
    icono: 'inventory_2',
    color: '#8b5cf6',
    leido: true,
  },
  {
    id: '4',
    titulo: 'Alerta técnica de vehículo',
    descripcion: 'Bus ABC-467: Revisión de SOAT en 5 días',
    tiempo: 'Hace 2 horas',
    icono: 'warning',
    color: '#f59e0b',
    leido: true,
  },
];

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
    case ROUTES.TAQUILLA:
      return {
        title: 'Venta de Tiquetes',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Taquilla &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Venta de Tiquetes</span>
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
    case ROUTES.PERFIL:
      return {
        title: 'Gestión de Perfil',
        breadcrumbs: (
          <>
            Inicio &rsaquo; Configuración &rsaquo;{' '}
            <span style={{ color: '#0D3B8E', fontWeight: 600 }}>Mi Perfil</span>
          </>
        ),
      };
    default:
      return {
        title: 'Dashboard General',
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { title, breadcrumbs } = getPageHeaderInfo(location.pathname);
  const { theme, isMobile, toggleMobile } = useSidebar();
  const isDark = theme === 'dark';

  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>(NOTIFICACIONES_INICIALES);
  const [menuNotificacionesAbierto, setMenuNotificacionesAbierto] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setMenuNotificacionesAbierto(false);
      }
    };
    if (menuNotificacionesAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuNotificacionesAbierto]);

  const handleMarcarTodoLeido = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  const handleToggleLeido = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: !n.leido } : n))
    );
  };

  return (
    <header
      style={{
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '16px 14px 4px 14px' : '24px 32px 4px 32px',
        flexShrink: 0,
        gap: '12px',
        position: 'relative',
      }}
    >
      {/* ── Left: Menu Button (Mobile) + Title and Breadcrumbs ─────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isMobile && (
          <button
            onClick={toggleMobile}
            title="Abrir menú"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#f8fafc' : '#0f172a',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              menu
            </span>
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <h1
            style={{
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: 800,
              color: isDark ? '#f8fafc' : '#0f172a',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>
          {!isMobile && (
            <p
              style={{
                fontSize: '12.5px',
                color: isDark ? '#94a3b8' : '#64748b',
                margin: 0,
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
            >
              {breadcrumbs}
            </p>
          )}
        </div>
      </div>

      {/* ── Right: Actions ───────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
        
        {/* Contenedor Botón y Menú de Notificaciones */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuNotificacionesAbierto((v) => !v)}
            title="Ver notificaciones del sistema"
            style={{
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
              background: menuNotificacionesAbierto ? (isDark ? '#27272a' : '#f1f5f9') : (isDark ? '#18181b' : 'white'),
              cursor: 'pointer',
              color: isDark ? '#cbd5e1' : '#64748b',
              position: 'relative',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#27272a' : '#ffffff';
              e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
            }}
            onMouseLeave={(e) => {
              if (!menuNotificacionesAbierto) {
                e.currentTarget.style.background = isDark ? '#18181b' : 'white';
              }
              e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.03)';
              e.currentTarget.style.color = isDark ? '#cbd5e1' : '#64748b';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              notifications
            </span>
            {noLeidas > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: isDark ? '0 0 0 2px #18181b' : '0 0 0 2px white',
                }}
              />
            )}
          </button>

          {/* Menú Desplegable de Notificaciones */}
          {menuNotificacionesAbierto && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: isMobile ? '290px' : '340px',
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.7)' : '0 12px 32px rgba(0,0,0,0.12)',
                zIndex: 120,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              {/* Encabezado del Dropdown */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                    Notificaciones
                  </span>
                  {noLeidas > 0 && (
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '10px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '10.5px',
                        fontWeight: 800,
                      }}
                    >
                      {noLeidas} nuevas
                    </span>
                  )}
                </div>

                {noLeidas > 0 && (
                  <button
                    onClick={handleMarcarTodoLeido}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#60a5fa' : '#2563eb',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Marcar todo leído
                  </button>
                )}
              </div>

              {/* Lista de Notificaciones */}
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notificaciones.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>
                      notifications_off
                    </span>
                    <span style={{ fontSize: '13px' }}>No hay notificaciones</span>
                  </div>
                ) : (
                  notificaciones.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleLeido(item.id)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f8fafc',
                        backgroundColor: item.leido
                          ? 'transparent'
                          : (isDark ? 'rgba(59, 130, 246, 0.08)' : '#f0f7ff'),
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f8fafc')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = item.leido
                          ? 'transparent'
                          : (isDark ? 'rgba(59, 130, 246, 0.08)' : '#f0f7ff'))
                      }
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {item.icono}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            fontWeight: item.leido ? 600 : 800,
                            color: isDark ? '#ffffff' : '#0f172a',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.titulo}
                        </p>
                        <p
                          style={{
                            margin: '3px 0 0 0',
                            fontSize: '11.5px',
                            color: isDark ? '#94a3b8' : '#64748b',
                            lineHeight: 1.3,
                          }}
                        >
                          {item.descripcion}
                        </p>
                        <span
                          style={{
                            display: 'block',
                            marginTop: '4px',
                            fontSize: '10.5px',
                            color: isDark ? '#64748b' : '#94a3b8',
                            fontWeight: 500,
                          }}
                        >
                          {item.tiempo}
                        </span>
                      </div>

                      {!item.leido && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            flexShrink: 0,
                            marginTop: '6px',
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pie del Dropdown */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f1f5f9',
                  backgroundColor: isDark ? '#141417' : '#f8fafc',
                  textAlign: 'center',
                }}
              >
                <button
                  onClick={() => {
                    setMenuNotificacionesAbierto(false);
                    navigate(ROUTES.PERFIL);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gestionar preferencias en Perfil
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botón de Configuración (Settings) */}
        <button
          onClick={() => navigate(ROUTES.PERFIL)}
          title="Ir a Configuración y Perfil"
          style={{
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            background: isDark ? '#18181b' : 'white',
            cursor: 'pointer',
            color: isDark ? '#cbd5e1' : '#64748b',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? '#27272a' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.08)';
            e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? '#18181b' : 'white';
            e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.03)';
            e.currentTarget.style.color = isDark ? '#cbd5e1' : '#64748b';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            settings
          </span>
        </button>

        {/* Avatar rápido en cabecera para móvil */}
        {isMobile && (
          <button
            onClick={() => navigate(ROUTES.PERFIL)}
            title="Mi Perfil"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            {user?.fotoperfil ? (
              <img
                src={user.fotoperfil}
                alt={user.nombre || 'Avatar'}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'
            )}
          </button>
        )}
      </div>
    </header>
  );
};
