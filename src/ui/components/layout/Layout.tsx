import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../hooks/useAuth';
import { perfilApi } from '../../../infrastructure/services/perfilApi';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  isLoading?: boolean;
}

export const Layout = ({ children, hideHeader, isLoading = false }: LayoutProps) => {
  const { collapsed, isMobile, theme } = useSidebar();
  const { user, setUser } = useAuth();
  const ml = isMobile ? 0 : (collapsed ? 98 : 284);
  const isDark = theme === 'dark';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && user) {
      perfilApi.obtenerPerfil().then((perfil) => {
        if (perfil && (perfil.fotoperfil !== user.fotoperfil || perfil.nombre !== user.nombre)) {
          setUser({
            ...user,
            fotoperfil: perfil.fotoperfil || user.fotoperfil,
            nombre: perfil.nombre || user.nombre,
            apellido: perfil.apellido !== undefined ? perfil.apellido : user.apellido,
          });
        }
      }).catch(() => {});
    }
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: isDark ? '#09090b' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      <Sidebar isLoading={isLoading} />
      {/* Main content area - scrollable */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          marginLeft: `${ml}px`,
          width: isMobile ? '100%' : 'auto',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!hideHeader && <Header />}
        
        {/* Main scrollable viewport */}
        <div
          className="flex-1 overflow-y-auto flex flex-col justify-between"
          style={{ minHeight: 0 }}
        >
          {/* Main page content */}
          <main
            style={{
              flex: '1 0 auto',
              padding: isMobile ? '12px 14px 24px' : '16px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {children}
          </main>

          {/* Modern Clean Footer */}
          <footer
            style={{
              flexShrink: 0,
              padding: isMobile ? '16px 14px' : '16px 32px',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
              backgroundColor: isDark ? '#09090b' : '#f8fafc',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: isMobile ? '10px' : '16px',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                }}
              />
              <p
                style={{
                  color: isDark ? '#71717a' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                © 2026 <strong style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>COOTRANAR R.L.</strong> · Sistema de Gestión y Despachos
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDark ? '#52525b' : '#94a3b8',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                v2.4
              </span>
              <a
                href="mailto:soporte@cootranar.com"
                style={{
                  color: isDark ? '#a1a1aa' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#a1a1aa' : '#64748b')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>help</span>
                Soporte Técnico
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: isDark ? '#a1a1aa' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#a1a1aa' : '#64748b')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>menu_book</span>
                Documentación
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
