import React, { useState } from 'react';

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

interface BuscadorViajesProps {
  pasoActual: string;
  onBuscar: (params: { ciudadorigen?: string; ciudaddestino?: string; fecha?: string }) => void;
  cargando?: boolean;
}

const PASOS = [
  { id: 'busqueda',          label: 'BUSCADOR',  icono: 'search'      },
  { id: 'seleccion-asientos',label: 'ASIENTOS',  icono: 'event_seat'  },
  { id: 'datos-pasajeros',   label: 'PASAJEROS', icono: 'person'      },
  { id: 'resumen',           label: 'PAGO',      icono: 'payments'    },
];

export const BuscadorViajes: React.FC<BuscadorViajesProps> = ({
  pasoActual,
  onBuscar,
  cargando = false,
}) => {
  const [ciudadOrigen,  setCiudadOrigen]  = useState('');
  const [ciudadDestino, setCiudadDestino] = useState('');
  const [fecha, setFecha] = useState('');

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
        overflow: 'hidden',
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
          <div style={{ gridColumn: 'span 4' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, marginBottom: '8px', letterSpacing: '0.04em' }}>
              CIUDAD ORIGEN
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', color: C.outline, fontSize: '20px', pointerEvents: 'none', zIndex: 1 }}>
                my_location
              </span>
              <input
                type="text"
                value={ciudadOrigen}
                onChange={e => setCiudadOrigen(e.target.value)}
                placeholder="Ej: Pasto"
                style={inputBase}
                onFocus={e => { e.currentTarget.style.borderColor = C.secondary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.secondaryFixed}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.outlineVariant; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
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
          <div style={{ gridColumn: 'span 3' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, marginBottom: '8px', letterSpacing: '0.04em' }}>
              CIUDAD DESTINO
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', color: C.outline, fontSize: '20px', pointerEvents: 'none', zIndex: 1 }}>
                location_on
              </span>
              <input
                type="text"
                value={ciudadDestino}
                onChange={e => setCiudadDestino(e.target.value)}
                placeholder="Ej: Cali"
                style={inputBase}
                onFocus={e => { e.currentTarget.style.borderColor = C.secondary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.secondaryFixed}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.outlineVariant; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
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
