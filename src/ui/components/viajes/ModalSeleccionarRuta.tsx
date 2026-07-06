import React, { useState, useEffect } from 'react';
import { rutasApi } from '../../../infrastructure/services/rutasApi';

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
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Seleccionar Ruta
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
              placeholder="Buscar por ciudad o nombre..."
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
              <span style={{ fontSize: '13px' }}>Cargando rutas...</span>
            </div>
          ) : rutasFiltradas.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>map</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>No se encontraron rutas</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rutasFiltradas.map((ruta) => (
                <button
                  key={ruta.idruta}
                  onClick={() => onSelect(ruta)}
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
                        route
                      </span>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: '14px' }}>
                          {ruta.ciudadorigen} → {ruta.ciudaddestino}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                          {ruta.nombreagenciaorigen} - {ruta.nombreagenciadestino}
                        </p>
                        {recorridos[ruta.idruta] && (
                          <p style={{ fontSize: '10px', color: '#64748b', margin: '3px 0 0 0', fontStyle: 'italic' }}>
                            Recorrido: {recorridos[ruta.idruta]}
                          </p>
                        )}
                        {(ruta.duracionh || ruta.duracionm) && (
                          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                            Duración: {ruta.duracionh ? `${ruta.duracionh}h ` : ''}{ruta.duracionm ? `${ruta.duracionm}min` : ''}
                          </p>
                        )}
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
