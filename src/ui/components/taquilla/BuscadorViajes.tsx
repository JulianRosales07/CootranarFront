import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ── Paleta Material You (extraída del HTML de referencia) ────────────────────
const C = {
  primary:          '#00355f',
  primaryContainer: '#0f4c81',
  onPrimary:        '#ffffff',
  secondary:        '#0058be',
  secondaryFixed:   '#d8e2ff',
  surface:          '#f8f9ff',
  surfaceBright:    '#f8f9ff',
  surfaceContainerLow: '#eff4ff',
  outline:          '#727780',
  outlineVariant:   '#c2c7d1',
  onSurface:        '#0b1c30',
  onSurfaceVariant: '#42474f',
};

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

interface Ciudad {
  idciudad: number;
  nombre: string;
  tipo?: 'ciudad' | 'punto';
}

interface BuscadorViajesProps {
  pasoActual: string;
  onBuscar: (params: { ciudadorigen?: string; ciudaddestino?: string; fecha?: string }) => void;
  onLimpiar?: () => void;
  cargando?: boolean;
}

const PASOS = [
  { id: 'busqueda',          label: 'BUSCADOR',  icono: 'search'      },
  { id: 'seleccion-asientos',label: 'ASIENTOS',  icono: 'event_seat'  },
  { id: 'datos-pasajeros',   label: 'PASAJEROS', icono: 'person'      },
  { id: 'resumen',           label: 'PAGO',      icono: 'payments'    },
];

/* ── Autocomplete Combobox Component ── */
interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  ciudades: Ciudad[];
  placeholder: string;
  icon: string;
  inputBase: React.CSSProperties;
  cargandoCiudades: boolean;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
  value, onChange, ciudades, placeholder, icon, inputBase, cargandoCiudades
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCities = ciudades.filter(c =>
    c.nombre.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', color: C.outline, fontSize: '20px', pointerEvents: 'none', zIndex: 1 }}>
          {icon}
        </span>
        {cargandoCiudades && (
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '14px', color: C.outline, fontSize: '16px', pointerEvents: 'none', zIndex: 1, animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={inputBase}
          autoComplete="off"
        />
      </div>

      {showDropdown && value.length > 0 && filteredCities.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#ffffff',
          border: `1px solid ${C.outlineVariant}`,
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {filteredCities.slice(0, 20).map(ciudad => (
            <div
              key={ciudad.idciudad}
              onClick={() => { onChange(ciudad.nombre); setShowDropdown(false); }}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                color: C.onSurface,
                cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: 'background 0.1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surfaceContainerLow)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span>{ciudad.nombre}</span>
              {ciudad.tipo && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: ciudad.tipo === 'ciudad' ? '#dcfce7' : '#f1f5f9',
                  color: ciudad.tipo === 'ciudad' ? '#15803d' : '#475569',
                }}>
                  {ciudad.tipo === 'ciudad' ? '★ Agencia' : 'Parada'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const BuscadorViajes: React.FC<BuscadorViajesProps> = ({
  pasoActual,
  onBuscar,
  onLimpiar,
  cargando = false,
}) => {
  const [ciudadOrigen,  setCiudadOrigen]  = useState('');
  const [ciudadDestino, setCiudadDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [opcionesDestino, setOpcionesDestino] = useState<Ciudad[]>([]);
  const [cargandoCiudades, setCargandoCiudades] = useState(true);

  // Cargar ciudades para origen + opciones destino (ciudades + puntos intermedios)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resCiudades, resDestinos] = await Promise.all([
          axios.get(`${API_URL}/ciudades/activas`, { withCredentials: true, params: { limit: 1000 } }),
          axios.get(`${API_URL}/plataforma-ecommerce/ciudades-destino`, { withCredentials: true }),
        ]);
        // Ciudades para origen (solo agencias)
        const dataCiudades = resCiudades.data?.data?.ciudades || resCiudades.data?.ciudades || [];
        setCiudades(Array.isArray(dataCiudades) ? dataCiudades : []);
        // Opciones destino (ciudades + puntos intermedios) - normalizar estructura
        const dataDestinos = resDestinos.data?.data || resDestinos.data || [];
        const destinosNormalizados = (Array.isArray(dataDestinos) ? dataDestinos : []).map((d: any) => ({
          idciudad: d.id || d.idciudad,
          nombre: d.nombre,
          tipo: d.tipo, // 'ciudad' | 'punto'
        }));
        setOpcionesDestino(destinosNormalizados);
      } catch (err) {
        console.error('Error cargando datos de autocomplete:', err);
      } finally {
        setCargandoCiudades(false);
      }
    };
    cargarDatos();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar({
      ciudadorigen:   ciudadOrigen.trim()  || undefined,
      ciudaddestino:  ciudadDestino.trim() || undefined,
      fecha:          fecha                || undefined,
    });
  };

  const handleLimpiar = () => {
    setCiudadOrigen('');
    setCiudadDestino('');
    setFecha('');
    onLimpiar?.();
  };

  const handleSwap = () => {
    const tmp = ciudadOrigen;
    setCiudadOrigen(ciudadDestino);
    setCiudadDestino(tmp);
  };

  const indicePaso = PASOS.findIndex(p => p.id === pasoActual);

  /* ── shared input style ── */
  const inputBase: React.CSSProperties = {
    width: '100%',
    paddingLeft: '48px',
    paddingRight: '16px',
    paddingTop: '14px',
    paddingBottom: '14px',
    background: C.surfaceBright,
    border: `1px solid ${C.outlineVariant}`,
    borderRadius: '8px',
    fontSize: '16px',
    lineHeight: '24px',
    color: C.onSurface,
    outline: 'none',
    fontFamily: "'Hanken Grotesk', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <section
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: `1px solid ${C.outlineVariant}`,
        boxShadow: '0px 4px 20px rgba(15,76,129,0.05)',
        padding: '32px',
        position: 'relative',
        overflow: 'visible',
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '256px', height: '256px',
        background: '#d2e4ff', opacity: 0.15,
        borderRadius: '50%', filter: 'blur(40px)',
        transform: 'translate(50%, -50%)', pointerEvents: 'none',
      }} />

      {/* ── Step Progress ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '560px', margin: '0 auto 40px', gap: 0 }}>
        {PASOS.map((paso, i) => {
          const isActive    = pasoActual === paso.id;
          const isCompleted = i < indicePaso;
          const isLast      = i === PASOS.length - 1;

          return (
            <React.Fragment key={paso.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: isCompleted ? '#22c55e' : isActive ? C.primary : C.surfaceContainerLow,
                  border: (!isCompleted && !isActive) ? `1px solid ${C.outlineVariant}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: (isActive || isCompleted) ? '#fff' : C.onSurfaceVariant,
                  boxShadow: isActive ? `0 4px 16px rgba(0,53,95,0.3)` : isCompleted ? '0 4px 12px rgba(34,197,94,0.2)' : 'none',
                  transition: 'all 0.3s',
                  cursor: isCompleted ? 'pointer' : 'default',
                }}>
                  {isCompleted
                    ? <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check</span>
                    : <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{paso.icono}</span>
                  }
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em',
                  color: isActive ? C.primary : isCompleted ? '#16a34a' : C.outline,
                  transition: 'color 0.3s',
                }}>
                  {paso.label}
                </span>
              </div>
              {!isLast && (
                <div style={{
                  flex: 1, height: '1px', background: C.outlineVariant,
                  marginBottom: '28px', maxWidth: '80px',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Search Form ── */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', alignItems: 'end' }}>

          {/* Ciudad Origen */}
          <div style={{ gridColumn: 'span 4', position: 'relative', zIndex: 20 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, marginBottom: '8px', letterSpacing: '0.04em' }}>
              CIUDAD ORIGEN
            </label>
            <AutocompleteInput
              value={ciudadOrigen}
              onChange={setCiudadOrigen}
              ciudades={ciudades}
              placeholder="Ej: Pasto"
              icon="my_location"
              inputBase={inputBase}
              cargandoCiudades={cargandoCiudades}
            />
          </div>

          {/* Swap */}
          <div style={{ gridColumn: 'span 1', display: 'flex', justifyContent: 'center', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={handleSwap}
              title="Intercambiar ciudades"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: `1px solid ${C.outlineVariant}`, background: C.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.primary, transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.surfaceContainerLow; e.currentTarget.style.transform = 'rotate(180deg)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.transform = 'rotate(0deg)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>swap_horiz</span>
            </button>
          </div>

          {/* Ciudad Destino */}
          <div style={{ gridColumn: 'span 3', position: 'relative', zIndex: 20 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, marginBottom: '8px', letterSpacing: '0.04em' }}>
              CIUDAD DESTINO
            </label>
            <AutocompleteInput
              value={ciudadDestino}
              onChange={setCiudadDestino}
              ciudades={opcionesDestino}
              placeholder="Ej: Cali, Popayán..."
              icon="location_on"
              inputBase={inputBase}
              cargandoCiudades={cargandoCiudades}
            />
          </div>

          {/* Fecha */}
          <div style={{ gridColumn: 'span 4' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, marginBottom: '8px', letterSpacing: '0.04em' }}>
              FECHA DE VIAJE
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', color: C.outline, fontSize: '20px', pointerEvents: 'none', zIndex: 1 }}>
                calendar_today
              </span>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={{ ...inputBase, cursor: 'pointer' }}
                onFocus={e => { e.currentTarget.style.borderColor = C.secondary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.secondaryFixed}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.outlineVariant; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Botones */}
          <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: `1px solid ${C.outlineVariant}` }}>
            <button
              type="button"
              onClick={handleLimpiar}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: C.secondary, background: 'none', border: 'none',
                fontSize: '12px', fontWeight: '600', letterSpacing: '0.06em',
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.primary}
              onMouseLeave={e => e.currentTarget.style.color = C.secondary}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              Limpiar Filtros
            </button>

            <button
              type="submit"
              disabled={cargando}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: C.primary, color: '#fff',
                padding: '14px 32px', borderRadius: '8px',
                border: 'none', cursor: cargando ? 'not-allowed' : 'pointer',
                fontSize: '15px', fontWeight: '700',
                boxShadow: '0 4px 16px rgba(0,53,95,0.25)',
                transition: 'all 0.2s',
                fontFamily: "'Hanken Grotesk', sans-serif",
                opacity: cargando ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!cargando) e.currentTarget.style.background = '#002d52'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; }}
            >
              {cargando ? (
                <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
              )}
              {cargando ? 'BUSCANDO...' : 'BUSCAR VIAJES'}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
};
