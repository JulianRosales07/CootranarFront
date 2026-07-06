import React from 'react';

const C = {
  primary:             '#00355f',
  primaryContainer:    '#0f4c81',
  secondary:           '#0058be',
  secondaryFixed:      '#d8e2ff',
  surface:             '#f8f9ff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainerLowest: '#ffffff',
  outline:             '#727780',
  outlineVariant:      '#c2c7d1',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#42474f',
  error:               '#ba1a1a',
  errorContainer:      '#ffdad6',
  onPrimary:           '#ffffff',
};

interface Viaje {
  idviaje: number;
  codigoviaje?: string;
  nombreruta: string;
  ciudadorigen: string;
  ciudaddestino: string;
  fechasalida: string;
  horasalida: string;
  numeromovil: string;
  placa: string;
  nombretipobus: string;
  tiposervicio: string;
  asientoslibres: number;
  totalasientos: number;
  tipoResultado?: 'DIRECTO' | 'DE_PASO';
  badge?: { tipo: string; texto: string; color: string };
  asientoslibrestramo?: number;
  tramoCiudadOrigen?: string;
  tramoCiudadDestino?: string;
  idpuntoorigen_buscado?: number;
  idpuntodestino_buscado?: number;
}

interface ListaViajesProps {
  viajes: Viaje[];
  onSeleccionar: (viaje: Viaje) => void;
  cargando?: boolean;
}

const formatearFecha = (f: string) => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatearHora = (h: string) => {
  if (!h) return '—';
  const [hh, mm] = String(h).split(':').map(Number);
  const p = hh >= 12 ? 'p.m.' : 'a.m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${p}`;
};

export const ListaViajes: React.FC<ListaViajesProps> = ({ viajes, onSeleccionar, cargando = false }) => {
  const font = "'Hanken Grotesk', sans-serif";

  if (cargando) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`, padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', fontFamily: font }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: C.secondary, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ fontSize: '14px', fontWeight: '600', color: C.onSurface }}>Buscando viajes disponibles...</p>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (viajes.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`, padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontFamily: font }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: C.surfaceContainerLow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: C.outline }}>search_off</span>
        </div>
        <p style={{ fontSize: '14px', fontWeight: '700', color: C.onSurface }}>No se encontraron viajes disponibles</p>
        <p style={{ fontSize: '13px', color: C.onSurfaceVariant }}>Ajusta los filtros o selecciona otra fecha</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`, boxShadow: '0px 4px 20px rgba(15,76,129,0.05)', overflow: 'hidden', fontFamily: font }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.outlineVariant}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surfaceContainerLow }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: C.onSurface, margin: 0 }}>Viajes Disponibles</h3>
          <p style={{ fontSize: '13px', color: C.onSurfaceVariant, marginTop: '2px' }}>Selecciona el horario y vehículo de tu preferencia</p>
        </div>
        <span style={{ padding: '6px 16px', background: C.secondaryFixed, color: C.primary, borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
          {viajes.length} {viajes.length === 1 ? 'viaje encontrado' : 'viajes encontrados'}
        </span>
      </div>

      {/* List */}
      <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
        {viajes.map((viaje, idx) => {
          const esDePaso = viaje.tipoResultado === 'DE_PASO';
          const asientosDisponibles = esDePaso && viaje.asientoslibrestramo != null
            ? viaje.asientoslibrestramo
            : viaje.asientoslibres;
          const pct = ((viaje.totalasientos - asientosDisponibles) / viaje.totalasientos) * 100;
          const avail = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e';
          const isLujo = viaje.nombretipobus.toLowerCase().includes('lujo') || viaje.nombretipobus.toLowerCase().includes('poltrona');

          return (
            <div
              key={viaje.idviaje}
              onClick={() => onSeleccionar(viaje)}
              style={{
                padding: '20px 24px',
                borderBottom: idx < viajes.length - 1 ? `1px solid ${C.outlineVariant}` : 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: '24px',
                alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surfaceContainerLow)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Ruta */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', background: C.secondaryFixed, color: C.primary, borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {viaje.nombreruta || 'Directa'}
                  </span>

                  {/* Badge DIRECTO / DE_PASO */}
                  {viaje.tipoResultado === 'DIRECTO' && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: '#dcfce7', color: '#15803d',
                    }}>
                      Completo
                    </span>
                  )}
                  {viaje.tipoResultado === 'DE_PASO' && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: '#f1f5f9', color: '#475569',
                    }}>
                      De Paso
                    </span>
                  )}

                  {viaje.badge && viaje.tipoResultado !== 'DIRECTO' && viaje.tipoResultado !== 'DE_PASO' && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: viaje.badge.color === 'verde' ? '#dcfce7' : '#f1f5f9',
                      color: viaje.badge.color === 'verde' ? '#15803d' : '#475569',
                    }}>
                      {viaje.badge.texto}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: C.onSurface }}>{viaje.ciudadorigen}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '80px', maxWidth: '120px' }}>
                    <div style={{ flex: 1, height: '2px', borderTop: '2px dashed #cbd5e1' }} />
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.outline }}>directions_bus</span>
                    <div style={{ flex: 1, height: '2px', borderTop: '2px dashed #cbd5e1' }} />
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: C.onSurface }}>{viaje.ciudaddestino}</span>
                </div>

                {/* Tramo info for DE_PASO */}
                {esDePaso && viaje.tramoCiudadOrigen && viaje.tramoCiudadDestino && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: C.outline }}>subdirectory_arrow_right</span>
                    <span style={{ fontSize: '12px', color: C.onSurfaceVariant, fontWeight: '600' }}>
                      Tramo: {viaje.tramoCiudadOrigen} → {viaje.tramoCiudadDestino}
                    </span>
                  </div>
                )}
              </div>

              {/* Horario */}
              <div style={{ minWidth: '120px' }}>
                <p style={{ fontSize: '10px', fontWeight: '800', color: C.outline, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Horario</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: C.onSurfaceVariant }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: C.outline }}>calendar_today</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{formatearFecha(viaje.fechasalida)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.primary }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                  <span style={{ fontSize: '14px', fontWeight: '800' }}>{formatearHora(viaje.horasalida)}</span>
                </div>
              </div>

              {/* Vehículo + disponibilidad */}
              <div style={{ minWidth: '130px' }}>
                <p style={{ fontSize: '10px', fontWeight: '800', color: C.outline, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Vehículo</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: C.onSurface }}>Móvil {viaje.numeromovil}</span>
                  <span style={{ padding: '2px 6px', background: '#fef9c3', color: '#713f12', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '10px', fontWeight: '800', fontFamily: 'monospace' }}>{viaje.placa}</span>
                </div>
                <p style={{ fontSize: '11px', color: C.onSurfaceVariant, marginBottom: '6px' }}>{viaje.nombretipobus}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: avail }}>event_seat</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: avail }}>{asientosDisponibles}</span>
                  <span style={{ fontSize: '11px', color: C.outline }}>
                    / {viaje.totalasientos} libres{esDePaso ? ' (tramo)' : ''}
                  </span>
                </div>
                <div style={{ width: '100px', height: '4px', background: '#e2e8f0', borderRadius: '999px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: avail, borderRadius: '999px', transition: 'width 0.5s' }} />
                </div>
                {isLujo && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: C.outline }} title="Wi-Fi">wifi</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: C.outline }} title="Poltrona">star</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={e => { e.stopPropagation(); onSeleccionar(viaje); }}
                style={{
                  padding: '12px 22px', background: C.primary, color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,53,95,0.2)',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                  fontFamily: font,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#002d52'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'none'; }}
              >
                Elegir
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
