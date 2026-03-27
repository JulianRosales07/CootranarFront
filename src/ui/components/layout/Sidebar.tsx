import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';

const SIDEBAR_BG = '#0b2454';
const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 64;

interface NavItem { path: string; label: string; icon: string; }
interface NavSection { title: string; items: NavItem[]; }

const sections: NavSection[] = [
  { title: 'Análisis', items: [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'analytics' },
  ]},
  { title: 'Gestión Base', items: [
    { path: ROUTES.CIUDADES, label: 'Gestión de Ciudades', icon: 'location_city' },
    { path: ROUTES.AGENCIAS, label: 'Gestión de Agencias', icon: 'store' },
    { path: ROUTES.OFICINAS, label: 'Gestión de Oficinas', icon: 'corporate_fare' },
  ]},
  { title: 'Operaciones', items: [
    { path: ROUTES.TIPOS_BUS, label: 'Gestión de Tipos de Bus', icon: 'directions_bus' },
    { path: ROUTES.TIPOS_SERVICIO, label: 'Gestión de Tipos de Servicio', icon: 'service_toolbox' },
    { path: ROUTES.VEHICULOS, label: 'Gestión de Vehículos', icon: 'airport_shuttle' },
    { path: ROUTES.RUTAS, label: 'Gestión de Rutas', icon: 'map' },
    { path: ROUTES.VIAJES, label: 'Gestión de Viajes', icon: 'departure_board' },
  ]},
  { title: 'Recursos y Legal', items: [
    { path: ROUTES.CONDUCTORES, label: 'Gestión de Conductores', icon: 'person_pin' },
    { path: ROUTES.ASEGURADORAS, label: 'Gestión de Aseguradoras', icon: 'health_and_safety' },
    { path: ROUTES.POLIZAS, label: 'Gestión de Pólizas', icon: 'gavel' },
    { path: ROUTES.USUARIOS, label: 'Gestión de Usuarios', icon: 'manage_accounts' },
  ]},
  { title: 'Gestión de Empleados', items: [
    { path: ROUTES.TAQUILLEROS, label: 'Taquilleros', icon: 'point_of_sale' },
    { path: ROUTES.EMPLEADOS_ENCOMIENDAS, label: 'Encomiendas', icon: 'package_2' },
  ]},
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const isActive = (path: string) => location.pathname === path;
  const w = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const handleLogout = async () => { await logout(); navigate(ROUTES.LOGIN); };

  /* ── Collapsed view: logo + nav icons + expand + logout ── */
  if (collapsed) {
    return (
      <aside style={{
        width: `${w}px`, backgroundColor: SIDEBAR_BG, color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transition: 'width 0.2s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#0D3B8E' }}>directions_bus</span>
          </div>
        </div>

        {/* Expand button */}
        <button onClick={toggle} title="Expandir menú" style={{
          margin: '12px 0 4px', width: '40px', height: '36px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)', transition: 'all 0.15s', flexShrink: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu</span>
        </button>

        {/* Nav icons */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0', width: '100%', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {sections.map((section, si) => (
            <div key={section.title}>
              {si > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 12px' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 0' }}>
                {section.items.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} title={item.label} style={{
                      width: '40px', height: '36px', borderRadius: '8px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                      color: active ? 'white' : 'rgba(255,255,255,0.5)',
                      backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; }}}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout button at bottom */}
        <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleLogout} title="Cerrar sesión" style={{
            width: '40px', height: '40px', borderRadius: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>logout</span>
          </button>
        </div>
      </aside>
    );
  }

  /* ── Expanded view ───────────────────────────── */
  return (
    <aside style={{
      width: `${w}px`, backgroundColor: SIDEBAR_BG, color: 'white',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      transition: 'width 0.2s ease',
    }}>
      {/* Logo + collapse btn */}
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#0D3B8E' }}>directions_bus</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1 }}>Cootranar</div>
          <div style={{ fontSize: '9px', opacity: 0.45, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <button onClick={toggle} title="Contraer menú" style={{
          width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', flexShrink: 0, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 0', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: '24px', padding: '0 16px' }}>
            <p style={{ fontSize: '9.5px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px', paddingLeft: '12px' }}>{section.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(item => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px',
                    textDecoration: 'none', fontSize: '13.5px', fontWeight: active ? '600' : '500',
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                    backgroundColor: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                    borderLeft: active ? '3px solid white' : '3px solid transparent', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ lineHeight: '1.3' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#c2844a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'white' }}>person</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: '700', lineHeight: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nombre ?? 'Juan Pérez'}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{user?.nombrerol ?? 'Administrador'}</p>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión" style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
