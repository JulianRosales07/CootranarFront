import React, { useState, useEffect } from 'react';
import { vehiculosApi } from '../../../infrastructure/services/vehiculosApi';

export interface VehiculoDespacho {
  idvehiculo: number;
  placa: string;
  numeromovil: string;
  tipovehiculo?: 'BUS' | 'FURGON' | string;
  nombretipobus?: string;
  capacidad?: number;
  idconductor1?: number | null;
  nombreconductor1?: string | null;
  apellidoconductor1?: string | null;
  documentoconductor1?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (vehiculo: VehiculoDespacho) => void;
}

const BLUE = '#0D3B8E';

/**
 * Modal para seleccionar el vehículo asignado a un despacho de encomiendas.
 * Permite seleccionar tanto Buses de pasajeros / terminal como Furgones de carga.
 */
export const ModalSeleccionarFurgon: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [vehiculos, setVehiculos] = useState<VehiculoDespacho[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'BUS' | 'FURGON'>('TODOS');

  useEffect(() => {
    if (isOpen) {
      cargarVehiculos();
    }
  }, [isOpen]);

  const cargarVehiculos = async () => {
    setCargando(true);
    try {
      const res = await vehiculosApi.obtenerActivos({ limit: 200 });
      const data = res.data?.data;
      setVehiculos(data?.vehiculos || data || []);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
      setVehiculos([]);
    } finally {
      setCargando(false);
    }
  };

  const totalBuses = vehiculos.filter((v) => v.tipovehiculo !== 'FURGON').length;
  const totalFurgones = vehiculos.filter((v) => v.tipovehiculo === 'FURGON').length;

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const esFurgon = v.tipovehiculo === 'FURGON';
    if (filtroTipo === 'BUS' && esFurgon) return false;
    if (filtroTipo === 'FURGON' && !esFurgon) return false;

    const q = busqueda.toLowerCase().trim();
    if (!q) return true;

    const placaMatch = v.placa?.toLowerCase().includes(q);
    const movilMatch = v.numeromovil?.toLowerCase().includes(q);
    const conductorMatch =
      v.nombreconductor1?.toLowerCase().includes(q) ||
      v.apellidoconductor1?.toLowerCase().includes(q);
    const tipoMatch = v.nombretipobus?.toLowerCase().includes(q);

    return placaMatch || movilMatch || conductorMatch || tipoMatch;
  });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Seleccionar Vehículo para Despacho
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
              Puedes despachar encomiendas en buses de línea (terminal) o en furgones de carga.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setFiltroTipo('TODOS')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroTipo === 'TODOS' ? BLUE : '#e2e8f0',
                background: filtroTipo === 'TODOS' ? BLUE : 'white',
                color: filtroTipo === 'TODOS' ? 'white' : '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              Todos ({vehiculos.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('BUS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroTipo === 'BUS' ? '#2563eb' : '#e2e8f0',
                background: filtroTipo === 'BUS' ? '#eff6ff' : 'white',
                color: filtroTipo === 'BUS' ? '#1d4ed8' : '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>directions_bus</span>
              <span>Buses Terminal ({totalBuses})</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('FURGON')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroTipo === 'FURGON' ? '#d97706' : '#e2e8f0',
                background: filtroTipo === 'FURGON' ? '#fef3c7' : 'white',
                color: filtroTipo === 'FURGON' ? '#b45309' : '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_shipping</span>
              <span>Furgones Carga ({totalFurgones})</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>search</span>
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por placa, número móvil, conductor o tipo de bus..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: '38px',
                paddingRight: '12px',
                paddingTop: '9px',
                paddingBottom: '9px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                background: 'white',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Content List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cargando ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>progress_activity</span>
              <span style={{ fontSize: '13px' }}>Cargando vehículos disponibles...</span>
            </div>
          ) : vehiculosFiltrados.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#cbd5e1' }}>directions_bus</span>
              <span style={{ fontSize: '13px' }}>
                {vehiculos.length === 0 ? 'No hay vehículos activos registrados' : 'No se encontraron vehículos que coincidan con la búsqueda'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vehiculosFiltrados.map((v) => {
                const esFurgon = v.tipovehiculo === 'FURGON';
                const conductorNombre = v.nombreconductor1
                  ? `${v.nombreconductor1} ${v.apellidoconductor1 ?? ''}`.trim()
                  : null;

                return (
                  <button
                    key={v.idvehiculo}
                    onClick={() => onSelect(v)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = esFurgon ? '#f59e0b' : BLUE;
                      e.currentTarget.style.background = esFurgon ? '#fffbeb' : '#f0f7ff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Icon Icon Container */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: esFurgon ? '#fef3c7' : '#dbeafe',
                          color: esFurgon ? '#b45309' : '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                          {esFurgon ? 'local_shipping' : 'directions_bus'}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', letterSpacing: '0.02em' }}>
                            {v.placa}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                            • Móvil #{v.numeromovil}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              textTransform: 'uppercase',
                              background: esFurgon ? '#fef3c7' : '#eff6ff',
                              color: esFurgon ? '#92400e' : '#1e40af',
                              border: `1px solid ${esFurgon ? '#fde68a' : '#bfdbfe'}`,
                            }}
                          >
                            {esFurgon ? 'Furgón (Carga)' : 'Bus (Terminal)'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                          {conductorNombre ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>person</span>
                              <span>{conductorNombre}</span>
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin conductor asignado</span>
                          )}

                          {!esFurgon && v.nombretipobus && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>airline_seat_recline_normal</span>
                              <span>{v.nombretipobus}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: '20px' }}>
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

