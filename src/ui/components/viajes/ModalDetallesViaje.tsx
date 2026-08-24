import React from 'react';
import { useSidebar } from '../../context/SidebarContext';

interface Conductor {
  idusuario: number;
  nombre: string;
  apellido: string;
  documento: string;
  numerolicencia: string;
  categorialicencia: string;
  esremplazo: boolean;
}

interface Viaje {
  idviaje: number;
  idruta: number;
  nombreruta: string;
  ciudadorigen: string;
  ciudaddestino: string;
  numeromovil: string;
  placa: string;
  nombretipobus: string;
  capacidad: number;
  fechasalida: string;
  horasalida: string;
  fechallegada?: string;
  estado: string;
  activo: boolean;
  conductores?: Conductor[];
}

interface Props {
  viaje: Viaje | null;
  onClose: () => void;
  cargando: boolean;
}

const BadgeEstado: React.FC<{ estado: string }> = ({ estado }) => {
  const estados: Record<string, { bg: string; color: string; border: string; texto: string }> = {
    'PROGRAMADO': { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', texto: 'PROGRAMADO' },
    'EN_CAMINO': { bg: '#dcfce7', color: '#166534', border: '#bbf7d0', texto: 'EN CAMINO' },
    'FINALIZADO': { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', texto: 'FINALIZADO' },
    'CANCELADO': { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', texto: 'CANCELADO' }
  };
  
  const config = estados[estado] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', texto: estado || '—' };
  
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      padding: '4px 12px', 
      borderRadius: '999px', 
      fontSize: '11.5px', 
      fontWeight: 700,
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`
    }}>
      {config.texto}
    </span>
  );
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const ModalDetallesViaje: React.FC<Props> = ({ viaje, onClose, cargando }) => {
  const { isMobile, theme } = useSidebar();
  const isDark = theme === 'dark';

  if (!viaje && !cargando) return null;

  const conductoresPrincipales = viaje?.conductores?.filter(c => !c.esremplazo) || [];
  const conductoresReemplazo = viaje?.conductores?.filter(c => c.esremplazo) || [];

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
        maxWidth: '768px', 
        maxHeight: isMobile ? '92vh' : '90vh', 
        overflowY: 'auto', 
        boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.7)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: isMobile ? '14px 16px' : '18px 24px', 
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          position: 'sticky', 
          top: 0, 
          background: isDark ? '#18181b' : 'white', 
          zIndex: 10 
        }}>
          <div>
            <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
              Detalles del Viaje
            </h3>
            {viaje && <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0', fontFamily: 'monospace' }}>ID: #{viaje.idviaje}</p>}
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

        {cargando ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#94a3b8', gap: '8px' }}>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px', color: '#3b82f6' }}>progress_activity</span>
            <span style={{ fontSize: '13px' }}>Cargando detalles...</span>
          </div>
        ) : viaje ? (
          <>
            {/* Content */}
            <div style={{ padding: isMobile ? '14px 16px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '18px' }}>
              {/* Estado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? '#212126' : '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569' }}>Estado del Viaje</span>
                <BadgeEstado estado={viaje.estado} />
              </div>

              {/* Información de la Ruta */}
              <div style={{ 
                background: isDark ? 'rgba(30, 58, 138, 0.15)' : '#eff6ff', 
                border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #bfdbfe', 
                borderRadius: '10px', 
                padding: isMobile ? '12px' : '16px' 
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#93c5fd' : '#1e40af', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
                  Información de la Ruta
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: '10px', 
                  fontSize: '12.5px' 
                }}>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Ruta:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{viaje.nombreruta || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>ID Ruta:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0', fontFamily: 'monospace' }}>{viaje.idruta}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Ciudad Origen:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{viaje.ciudadorigen}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Ciudad Destino:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{viaje.ciudaddestino}</p>
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div style={{ 
                background: isDark ? 'rgba(22, 101, 52, 0.15)' : '#f0fdf4', 
                border: isDark ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid #bbf7d0', 
                borderRadius: '10px', 
                padding: isMobile ? '12px' : '16px' 
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#86efac' : '#166534', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>directions_bus</span>
                  Información del Vehículo
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                  gap: '10px', 
                  fontSize: '12.5px' 
                }}>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Número Móvil:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0', fontFamily: 'monospace' }}>{viaje.numeromovil}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Placa:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0', fontFamily: 'monospace' }}>{viaje.placa}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Tipo:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{viaje.nombretipobus}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Capacidad:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{viaje.capacidad} pasajeros</p>
                  </div>
                </div>
              </div>

              {/* Conductores Principales */}
              {conductoresPrincipales.length > 0 && (
                <div style={{ 
                  background: isDark ? 'rgba(126, 34, 206, 0.15)' : '#faf5ff', 
                  border: isDark ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid #e9d5ff', 
                  borderRadius: '10px', 
                  padding: isMobile ? '12px' : '16px' 
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#d8b4fe' : '#7e22ce', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span>
                    Conductores Asignados
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {conductoresPrincipales.map((conductor, idx) => (
                      <div key={conductor.idusuario} style={{ 
                        background: isDark ? '#1f1f23' : 'white', 
                        borderRadius: '8px', 
                        padding: '10px 12px', 
                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e9d5ff' 
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#c084fc' : '#7e22ce', display: 'block', marginBottom: '6px' }}>
                          {idx === 0 ? 'Conductor Principal' : 'Conductor Secundario'}
                        </span>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                          gap: '8px', 
                          fontSize: '12px' 
                        }}>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Nombre:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>
                              {conductor.nombre} {conductor.apellido}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Documento:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>{conductor.documento}</p>
                          </div>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Licencia:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>{conductor.numerolicencia}</p>
                          </div>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Categoría:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>{conductor.categorialicencia}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conductores de Reemplazo */}
              {conductoresReemplazo.length > 0 && (
                <div style={{ 
                  background: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb', 
                  border: isDark ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid #fde68a', 
                  borderRadius: '10px', 
                  padding: isMobile ? '12px' : '16px' 
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#fcd34d' : '#d97706', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>swap_horiz</span>
                    Conductores de Reemplazo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {conductoresReemplazo.map((conductor) => (
                      <div key={conductor.idusuario} style={{ 
                        background: isDark ? '#1f1f23' : 'white', 
                        borderRadius: '8px', 
                        padding: '10px 12px', 
                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #fde68a' 
                      }}>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                          gap: '8px', 
                          fontSize: '12px' 
                        }}>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Nombre:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>
                              {conductor.nombre} {conductor.apellido}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Documento:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>{conductor.documento}</p>
                          </div>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Licencia:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>{conductor.numerolicencia}</p>
                          </div>
                          <div>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Categoría:</span>
                            <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '1px 0 0 0' }}>{conductor.categorialicencia}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div style={{ 
                background: isDark ? 'rgba(194, 65, 12, 0.15)' : '#fff7ed', 
                border: isDark ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid #fed7aa', 
                borderRadius: '10px', 
                padding: isMobile ? '12px' : '16px' 
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#fdba74' : '#c2410c', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                  Fechas y Horarios
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: '10px', 
                  fontSize: '12.5px' 
                }}>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Fecha de Salida:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{formatearFecha(viaje.fechasalida)}</p>
                  </div>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px' }}>Fecha de Llegada:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{formatearFecha(viaje.fechallegada || '')}</p>
                  </div>
                </div>
              </div>

              {/* Estado Activo/Inactivo */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px 14px', 
                background: isDark ? '#212126' : '#f8fafc', 
                borderRadius: '10px' 
              }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b' }}>Estado de Registro</span>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '3px 10px', 
                  borderRadius: '999px', 
                  fontSize: '11px', 
                  fontWeight: 700,
                  background: viaje.activo ? '#dcfce7' : '#f1f5f9',
                  color: viaje.activo ? '#15803d' : '#64748b',
                  border: `1px solid ${viaje.activo ? '#bbf7d0' : '#e2e8f0'}`
                }}>
                  {viaje.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              padding: isMobile ? '12px 16px' : '14px 24px', 
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9', 
              display: 'flex', 
              justifyContent: 'flex-end',
              background: isDark ? '#141417' : '#fafafa'
            }}>
              <button
                onClick={onClose}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '9px 24px',
                  background: isDark ? '#27272a' : '#f1f5f9',
                  color: isDark ? '#f8fafc' : '#475569',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cerrar
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
