import React, { useState, useEffect } from 'react';
import { rutasApi } from '../../../infrastructure/services/rutasApi';
import { useSidebar } from '../../context/SidebarContext';

interface Ruta {
  idruta: number;
  nombre: string;
  ciudadorigen: string;
  ciudaddestino: string;
  nombreagenciaorigen: string;
  nombreagenciadestino: string;
  duracionh?: number;
  duracionm?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ruta: Ruta) => void;
}

export const ModalSeleccionarRuta: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const { isMobile, theme } = useSidebar();
  const isDark = theme === 'dark';

  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [recorridos, setRecorridos] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      cargarRutas();
    }
  }, [isOpen]);

  const cargarRutas = async () => {
    setCargando(true);
    try {
      const [resRutas, resRecorridos] = await Promise.all([
        rutasApi.obtenerTodas({ limit: 100 }),
        rutasApi.obtenerResumenRecorridos ? rutasApi.obtenerResumenRecorridos() : Promise.resolve(null),
      ]);

      const rutasData = resRutas.data.data?.rutas || resRutas.data.data || [];
      
      // Deduplicar rutas por idruta
      const rutasUnicas: Ruta[] = [];
      const seen = new Set<number>();
      
      for (const ruta of rutasData) {
        if (!seen.has(ruta.idruta)) {
          seen.add(ruta.idruta);
          rutasUnicas.push(ruta);
        }
      }
      
      setRutas(rutasUnicas);

      // Mapear recorridos
      if (resRecorridos?.data?.data?.recorridos) {
        const map: Record<number, string> = {};
        for (const r of resRecorridos.data.data.recorridos) {
          map[r.idruta] = r.recorrido;
        }
        setRecorridos(map);
      }
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setCargando(false);
    }
  };

  const rutasFiltradas = rutas.filter(r => 
    r.ciudadorigen?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.ciudaddestino?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '12px' : '24px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ 
        background: isDark ? '#18181b' : 'white', 
        borderRadius: isMobile ? '14px' : '16px', 
        width: '100%', 
        maxWidth: '640px', 
        maxHeight: isMobile ? '90vh' : '85vh', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.7)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: isMobile ? '14px 16px' : '18px 24px', 
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#3b82f6' }}>
              route
            </span>
            <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
              Seleccionar Ruta
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: isDark ? '#27272a' : '#f1f5f9', 
              border: 'none', 
              cursor: 'pointer', 
              color: isDark ? '#cbd5e1' : '#64748b', 
              padding: 0,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ 
          padding: isMobile ? '12px 16px' : '14px 24px', 
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
          background: isDark ? '#141417' : '#fafafa'
        }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>search</span>
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por ciudad o nombre..."
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '12px',
                paddingTop: '9px',
                paddingBottom: '9px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                background: isDark ? '#1e1e24' : 'white',
                color: isDark ? '#f8fafc' : '#1e293b',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 16px' : '16px 24px' }}>
          {cargando ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8', gap: '8px' }}>
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: '26px', color: '#3b82f6' }}>progress_activity</span>
              <span style={{ fontSize: '13px' }}>Cargando rutas disponibles...</span>
            </div>
          ) : rutasFiltradas.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: isDark ? '#3f3f46' : '#cbd5e1' }}>map</span>
              <span style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>No se encontraron rutas</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rutasFiltradas.map((ruta) => (
                <button
                  key={ruta.idruta}
                  onClick={() => onSelect(ruta)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px 16px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    background: isDark ? '#1f1f23' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.background = isDark ? '#27272a' : '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
                    e.currentTarget.style.background = isDark ? '#1f1f23' : 'white';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
                      color: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        route
                      </span>
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontSize: '13.5px', lineHeight: 1.2 }}>
                        {ruta.ciudadorigen} → {ruta.ciudaddestino}
                      </p>
                      <p style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', margin: '3px 0 0 0' }}>
                        {ruta.nombreagenciaorigen} - {ruta.nombreagenciadestino}
                      </p>
                      {recorridos[ruta.idruta] && (
                        <p style={{ fontSize: '10.5px', color: isDark ? '#71717a' : '#64748b', margin: '3px 0 0 0', fontStyle: 'italic' }}>
                          Recorrido: {recorridos[ruta.idruta]}
                        </p>
                      )}
                      {(ruta.duracionh || ruta.duracionm) && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '3px', 
                          fontSize: '10.5px', 
                          color: '#3b82f6', 
                          background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginTop: '4px'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>timer</span>
                          {ruta.duracionh ? `${ruta.duracionh}h ` : ''}{ruta.duracionm ? `${ruta.duracionm}min` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="material-symbols-outlined" style={{ color: isDark ? '#52525b' : '#cbd5e1', flexShrink: 0 }}>
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
