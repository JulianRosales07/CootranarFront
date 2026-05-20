import React from 'react';

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
  const estados: Record<string, { clase: string; texto: string }> = {
    'PROGRAMADO': { clase: 'bg-blue-100 text-blue-800 border-blue-200', texto: 'PROGRAMADO' },
    'EN_CAMINO': { clase: 'bg-green-100 text-green-800 border-green-200', texto: 'EN CAMINO' },
    'FINALIZADO': { clase: 'bg-gray-100 text-gray-800 border-gray-200', texto: 'FINALIZADO' },
    'CANCELADO': { clase: 'bg-red-100 text-red-800 border-red-200', texto: 'CANCELADO' }
  };
  
  const config = estados[estado] || { clase: 'bg-gray-100 text-gray-800 border-gray-200', texto: estado || '—' };
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }} className={config.clase}>
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
  if (!viaje && !cargando) return null;

  const conductoresPrincipales = viaje?.conductores?.filter(c => !c.esremplazo) || [];
  const conductoresReemplazo = viaje?.conductores?.filter(c => c.esremplazo) || [];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '768px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Detalles del Viaje
            </h3>
            {viaje && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>ID: {viaje.idviaje}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#94a3b8', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>progress_activity</span>
            <span style={{ fontSize: '13px' }}>Cargando detalles...</span>
          </div>
        ) : viaje ? (
          <>
            {/* Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Estado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Estado del Viaje</span>
                <BadgeEstado estado={viaje.estado} />
              </div>

              {/* Información de la Ruta */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
                  Información de la Ruta
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Ruta:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.nombreruta || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>ID Ruta:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.idruta}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ciudad Origen:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.ciudadorigen}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ciudad Destino:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.ciudaddestino}</p>
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#166534', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>directions_bus</span>
                  Información del Vehículo
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Número Móvil:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.numeromovil}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Placa:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.placa}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Tipo:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.nombretipobus}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Capacidad:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{viaje.capacidad} pasajeros</p>
                  </div>
                </div>
              </div>

              {/* Conductores Principales */}
              {conductoresPrincipales.length > 0 && (
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#7e22ce', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span>
                    Conductores Asignados
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {conductoresPrincipales.map((conductor, idx) => (
                      <div key={conductor.idusuario} style={{ background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #e9d5ff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7e22ce' }}>
                            {idx === 0 ? 'Conductor Principal' : 'Conductor Secundario'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Nombre:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>
                              {conductor.nombre} {conductor.apellido}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Documento:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{conductor.documento}</p>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Licencia:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{conductor.numerolicencia}</p>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Categoría:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{conductor.categorialicencia}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conductores de Reemplazo */}
              {conductoresReemplazo.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#d97706', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>swap_horiz</span>
                    Conductores de Reemplazo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {conductoresReemplazo.map((conductor) => (
                      <div key={conductor.idusuario} style={{ background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #fde68a' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Nombre:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>
                              {conductor.nombre} {conductor.apellido}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Documento:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{conductor.documento}</p>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Licencia:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{conductor.numerolicencia}</p>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Categoría:</span>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{conductor.categorialicencia}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                  Fechas y Horarios
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Fecha de Salida:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{formatearFecha(viaje.fechasalida)}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Fecha de Llegada:</span>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{formatearFecha(viaje.fechallegada || '')}</p>
                  </div>
                </div>
              </div>

              {/* Estado Activo/Inactivo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Estado de Registro</span>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '4px 12px', 
                  borderRadius: '999px', 
                  fontSize: '11px', 
                  fontWeight: 600,
                  background: viaje.activo ? '#dcfce7' : '#f1f5f9',
                  color: viaje.activo ? '#15803d' : '#64748b',
                  border: `1px solid ${viaje.activo ? '#bbf7d0' : '#e2e8f0'}`
                }}>
                  {viaje.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 24px',
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
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
