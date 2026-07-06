import React from 'react';

const BLUE = '#0D3B8E';

export interface PuntoIntermedio {
  _id: number;
  nombre: string;
  esAgencia: boolean;
  idagencia: string | null;
  tiempodesdeanteriorth: number;
  tiempodesdeanteriorm: number;
}

interface Agencia {
  idagencia: number;
  nombre: string;
  [key: string]: any;
}

interface Props {
  puntos: PuntoIntermedio[];
  agencias: Agencia[];
  origenId: string;
  destinoId: string;
  origenNombre: string;
  destinoNombre: string;
  onAgregar: () => void;
  onEliminar: (id: number) => void;
  onMover: (id: number, dir: number) => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onToggleAgencia: (id: number) => void;
}

const formatHM = (h: number, m: number) => {
  h = parseInt(String(h)) || 0;
  m = parseInt(String(m)) || 0;
  if (!h && !m) return '—';
  if (h && m) return `${h}h ${m}min`;
  return h ? `${h}h` : `${m}min`;
};

const s: Record<string, React.CSSProperties> = {
  card: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' },
  badge: { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '4px' },
  input: { width: '100%', boxSizing: 'border-box' as const, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit' },
  select: { width: '100%', boxSizing: 'border-box' as const, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit', appearance: 'none' as const },
  numInput: { width: '56px', padding: '8px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', textAlign: 'center' as const, outline: 'none', fontFamily: 'inherit' },
  iconBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export const PuntosIntermedios: React.FC<Props> = ({
  puntos, agencias, origenId, destinoId, origenNombre, destinoNombre,
  onAgregar, onEliminar, onMover, onUpdate, onToggleAgencia,
}) => {
  const showReady = origenId && destinoId;

  // Debug: verificar que las agencias llegan al componente
  React.useEffect(() => {
    console.log('Agencias en PuntosIntermedios:', agencias);
    console.log('Cantidad de agencias:', agencias?.length);
  }, [agencias]);

  if (!showReady) {
    return (
      <div style={{ fontSize: '13px', color: BLUE, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px' }}>
        Selecciona agencia origen y destino para configurar puntos intermedios.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Visualización del recorrido */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <VizNodo label={origenNombre} tipo="origen" />
          {puntos.map((p, _i) => {
            const label = p.esAgencia
              ? (agencias.find(a => a.idagencia === parseInt(p.idagencia || ''))?.nombre || 'Agencia...')
              : (p.nombre || 'Punto...');
            return (
              <React.Fragment key={p._id}>
                <VizConector h={p.tiempodesdeanteriorth} m={p.tiempodesdeanteriorm} />
                <VizNodo label={label} tipo={p.esAgencia ? 'agencia' : 'parada'} />
              </React.Fragment>
            );
          })}
          <VizConector h={0} m={0} />
          <VizNodo label={destinoNombre} tipo="destino" />
        </div>
      </div>

      {/* Punto origen fijo */}
      <div style={{ ...s.card, background: '#f0f6ffff', borderColor: '#f0f4f9ff' }}>
        <div style={{ ...s.badge, background: '#0D3B8E', color: 'white' }}>0</div>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#374151', alignSelf: 'center' }}>{origenNombre}</span>
        <span style={{ fontSize: '11px', padding: '2px 10px', background: '#d8e8ffff',border:'solid 1px #0D3B8E', color: '#002975ff', borderRadius: '12px', fontWeight: 600 }}>★ Origen</span>
      </div>

      {/* Puntos intermedios editables */}
      {puntos.map((p, i) => (
        <div key={p._id} style={s.card}>
          <div style={{ ...s.badge, background: '#d1d5db', color: '#4b5563' }}>{i + 1}</div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              {p.esAgencia ? (
                <select value={p.idagencia || ''} onChange={e => onUpdate(p._id, 'idagencia', e.target.value)} style={s.select}>
                  <option value="">Seleccionar agencia...</option>
                  {agencias
                    .filter(a => a.idagencia !== parseInt(origenId) && a.idagencia !== parseInt(destinoId))
                    .map(a => <option key={a.idagencia} value={a.idagencia}>{a.nombre}</option>)}
                </select>
              ) : (
                <input type="text" value={p.nombre} onChange={e => onUpdate(p._id, 'nombre', e.target.value)}
                  placeholder="Nombre del punto (ej: Remolino)" style={s.input} />
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input type="number" min="0" max="99" value={p.tiempodesdeanteriorth}
                onChange={e => onUpdate(p._id, 'tiempodesdeanteriorth', e.target.value)} style={s.numInput} placeholder="0" />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>h</span>
              <input type="number" min="0" max="59" value={p.tiempodesdeanteriorm}
                onChange={e => onUpdate(p._id, 'tiempodesdeanteriorm', e.target.value)} style={s.numInput} placeholder="0" />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>min desde ant.</span>
            </div>
          </div>
          {/* Toggle agencia/parada */}
          <button type="button" onClick={() => onToggleAgencia(p._id)} style={{
            ...s.iconBtn, gap: '4px', fontSize: '11px', padding: '4px 8px', borderRadius: '12px', flexShrink: 0, marginTop: '4px',
            background: p.esAgencia ? '#e7eaffff' : '#f1f5f9', color: p.esAgencia ? '#0D3B8E' : '#64748b',
            borderColor: p.esAgencia ? '#0D3B8E' : '#e2e8f0',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{p.esAgencia ? 'store' : 'location_on'}</span>
            {p.esAgencia ? 'Agencia' : 'Parada'}
          </button>
          {/* Mover / Eliminar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
            <button type="button" onClick={() => onMover(p._id, -1)} disabled={i === 0}
              style={{ ...s.iconBtn, opacity: i === 0 ? 0.3 : 1, color: '#64748b' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
            </button>
            <button type="button" onClick={() => onMover(p._id, 1)} disabled={i === puntos.length - 1}
              style={{ ...s.iconBtn, opacity: i === puntos.length - 1 ? 0.3 : 1, color: '#64748b' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_downward</span>
            </button>
            <button type="button" onClick={() => onEliminar(p._id)}
              style={{ ...s.iconBtn, color: '#ef4444', borderColor: '#fecaca' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            </button>
          </div>
        </div>
      ))}

      {/* Punto destino fijo */}
      <div style={{ ...s.card, background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div style={{ ...s.badge, background: '#1e293b', color: 'white' }}>{puntos.length + 1}</div>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#374151', alignSelf: 'center' }}>{destinoNombre}</span>
        <span style={{ fontSize: '11px', padding: '2px 10px', background: '#e2e8f0', color: '#475569', borderRadius: '12px', fontWeight: 600 }}>Destino final</span>
      </div>

      <button type="button" onClick={onAgregar} style={{
        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: BLUE,
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit', fontWeight: 600,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        Agregar punto intermedio
      </button>
    </div>
  );
};

/* Sub-componentes de visualización */
function VizNodo({ label, tipo }: { label: string; tipo: 'origen' | 'destino' | 'agencia' | 'parada' }) {
  const colors: Record<string, { bg: string; color: string; border?: string }> = {
    origen: { bg: '#0D3B8E', color: 'white' },
    destino: { bg: '#1e293b', color: 'white' },
    agencia: { bg: '#d8e8ffff', color: '#0D3B8E', border: '2px solid #0D3B8E' },
    parada: { bg: 'white', color: '#94a3b8', border: '1px dashed #d1d5db' },
  };
  const c = colors[tipo];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '70px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, background: c.bg, color: c.color, border: c.border }}>
        {label.substring(0, 2).toUpperCase()}
      </div>
      <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</span>
      {(tipo === 'origen' || tipo === 'agencia') && (
        <span style={{ fontSize: '9px', color: '#0D3B8E', fontWeight: 600 }}>★ vende</span>
      )}
    </div>
  );
}

function VizConector({ h, m }: { h: number; m: number }) {
  const txt = (h || m) ? formatHM(h, m) : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
      {txt && <span style={{ fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{txt}</span>}
      <div style={{ width: '28px', height: '2px', background: '#d1d5db' }} />
    </div>
  );
}
