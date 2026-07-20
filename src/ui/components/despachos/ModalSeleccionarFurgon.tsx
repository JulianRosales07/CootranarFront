import React, { useState, useEffect } from 'react';
import { vehiculosApi } from '../../../infrastructure/services/vehiculosApi';

interface Furgon {
  idvehiculo: number;
  placa: string;
  numeromovil: string;
  idconductor1?: number | null;
  nombreconductor1?: string | null;
  apellidoconductor1?: string | null;
  documentoconductor1?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (furgon: Furgon) => void;
}

/**
 * Modal para seleccionar el furgón asignado a un despacho de encomiendas,
 * siguiendo el mismo patrón visual que ModalSeleccionarRuta (tarjetas
 * buscables en vez de combobox).
 */
export const ModalSeleccionarFurgon: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [furgones, setFurgones] = useState<Furgon[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarFurgones();
    }
  }, [isOpen]);

  const cargarFurgones = async () => {
    setCargando(true);
    try {
      const res = await vehiculosApi.obtenerActivos({ tipo: 'FURGON', limit: 100 });
      const data = res.data?.data;
      setFurgones(data?.vehiculos || data || []);
    } catch (err) {
      console.error('Error cargando furgones:', err);
      setFurgones([]);
    } finally {
      setCargando(false);
    }
  };

  const furgonesFiltrados = furgones.filter(f =>
    f.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.numeromovil?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.nombreconductor1?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Seleccionar Furgón
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>search</span>
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por placa, móvil o conductor..."
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cargando ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>progress_activity</span>
              <span style={{ fontSize: '13px' }}>Cargando furgones...</span>
            </div>
          ) : furgonesFiltrados.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>local_shipping</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {furgones.length === 0 ? 'No hay furgones activos registrados' : 'No se encontraron furgones'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {furgonesFiltrados.map((furgon) => (
                <button
                  key={furgon.idvehiculo}
                  onClick={() => onSelect(furgon)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0D3B8E';
                    e.currentTarget.style.background = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#0D3B8E' }}>
                        local_shipping
                      </span>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: '14px' }}>
                          {furgon.placa} - Móvil #{furgon.numeromovil}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                          {furgon.nombreconductor1
                            ? `Conductor: ${furgon.nombreconductor1} ${furgon.apellidoconductor1 ?? ''}`
                            : 'Sin conductor asignado'}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: '#cbd5e1' }}>
                      chevron_right
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
