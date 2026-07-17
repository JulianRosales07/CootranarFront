import React from 'react';
import type { EncomiendaDTO, EstadoEncomienda } from '../../../application/dto/EncomiendaDTO';

const BLUE = '#0D3B8E';

const ESTADOS: { value: EstadoEncomienda; label: string; bg: string; color: string }[] = [
  { value: 'COTIZADA', label: 'Cotizada', bg: '#f1f5f9', color: '#475569' },
  { value: 'REGISTRADA', label: 'Registrada', bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'EN_TRANSITO', label: 'En Tránsito', bg: '#fef9c3', color: '#a16207' },
  { value: 'EN_DESTINO', label: 'En Destino', bg: '#e0f2fe', color: '#0369a1' },
  { value: 'ENTREGADA', label: 'Entregada', bg: '#dcfce7', color: '#15803d' },
  { value: 'DEVUELTA', label: 'Devuelta', bg: '#fee2e2', color: '#dc2626' },
];

function EstadoBadge({ estado }: { estado: EstadoEncomienda }) {
  const cfg = ESTADOS.find(e => e.value === estado) || ESTADOS[0];
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontSize: '11.5px', fontWeight: 700 }}>
      {cfg.label}
    </span>
  );
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      minWidth: '30px', height: '30px', padding: '0 6px', border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
      borderRadius: '6px', background: active ? BLUE : 'white', color: active ? 'white' : '#475569',
      fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit',
    }}>{label}</button>
  );
}

function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '30px', height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer', color: disabled ? '#cbd5e1' : '#475569',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </button>
  );
}

interface AccionesEncomienda {
  onVer?: (enc: EncomiendaDTO) => void;
  onEliminar?: (enc: EncomiendaDTO) => void;
  onConfirmarRecepcion?: (enc: EncomiendaDTO) => void;
  onEntregar?: (enc: EncomiendaDTO) => void;
  onDevolver?: (enc: EncomiendaDTO) => void;
}

interface TablaEncomiendasProps extends AccionesEncomienda {
  encomiendas: EncomiendaDTO[];
  isLoading: boolean;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (valor: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPaginas: number;
  totalRegistros: number;
  idOficinaEmpleado?: string;
  /** Ids de encomiendas seleccionadas para despacho (opcional, si se habilita selección). */
  seleccionadas?: Set<string>;
  onToggleSeleccion?: (id: string) => void;
  mostrarSeleccion?: boolean;
}

/**
 * Tabla de encomiendas con buscador general, filtro por estado, paginación
 * y botones contextuales de cambio de estado según el estado actual y si la
 * oficina del empleado es la de destino.
 */
export const TablaEncomiendas: React.FC<TablaEncomiendasProps> = ({
  encomiendas,
  isLoading,
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstadoChange,
  page,
  onPageChange,
  totalPaginas,
  totalRegistros,
  idOficinaEmpleado,
  onVer,
  onEliminar,
  onConfirmarRecepcion,
  onEntregar,
  onDevolver,
  seleccionadas,
  onToggleSeleccion,
  mostrarSeleccion,
}) => {
  const visiblePages = (() => {
    if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const p: (number | '...')[] = [1];
    if (page > 3) p.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPaginas - 1, page + 1); i++) p.push(i);
    if (page < totalPaginas - 2) p.push('...');
    p.push(totalPaginas);
    return p;
  })();

  const esOficinaDestino = (enc: EncomiendaDTO) => !!idOficinaEmpleado && enc.idOficinaDestino === idOficinaEmpleado;

  const columnas = ['Referencia', 'Remitente', 'Destinatario', 'Origen', 'Destino', 'Peso', 'Estado', 'Fecha', 'Acciones'];

  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Encomiendas</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>search</span>
            <input
              value={busqueda}
              onChange={e => onBusquedaChange(e.target.value)}
              placeholder="Buscar por referencia, remitente o destinatario..."
              style={{ padding: '7px 12px 7px 32px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', color: '#334155', outline: 'none', fontFamily: 'inherit', minWidth: '240px' }}
            />
          </div>
          <select
            value={filtroEstado}
            onChange={e => onFiltroEstadoChange(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', color: '#334155', outline: 'none', fontFamily: 'inherit', background: 'white' }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(es => <option key={es.value} value={es.value}>{es.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
          <span style={{ fontSize: '13px' }}>Cargando encomiendas...</span>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {mostrarSeleccion && <th style={{ padding: '11px 16px', width: '32px' }} />}
                  {columnas.map(l => (
                    <th key={l} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {encomiendas.length === 0 ? (
                  <tr><td colSpan={columnas.length + (mostrarSeleccion ? 1 : 0)} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron encomiendas.</td></tr>
                ) : encomiendas.map((enc) => {
                  const destino = esOficinaDestino(enc);
                  return (
                    <tr key={enc.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      {mostrarSeleccion && (
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="checkbox"
                            checked={seleccionadas?.has(enc.id) ?? false}
                            disabled={enc.estado !== 'REGISTRADA'}
                            onChange={() => onToggleSeleccion?.(enc.id)}
                          />
                        </td>
                      )}
                      <td style={{ padding: '12px 16px', fontSize: '12.5px', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>{enc.referencia}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                        {enc.nombreRemitente || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                        {enc.nombreDestinatario}
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>{enc.documentoDestinatario}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{enc.oficinaOrigenNombre || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{enc.oficinaDestinoNombre || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{enc.pesoReal ?? enc.pesoEstimado ?? '-'} kg</td>
                      <td style={{ padding: '12px 16px' }}>
                        <EstadoBadge estado={enc.estado} />
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatearFecha(enc.fechaRegistro)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {onVer && (
                            <button onClick={() => onVer(enc)} title="Ver detalle" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = '#0D3B8E')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                            </button>
                          )}
                          {enc.estado === 'COTIZADA' && onEliminar && (
                            <button onClick={() => onEliminar(enc)} title="Eliminar" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          )}
                          {enc.estado === 'EN_TRANSITO' && destino && onConfirmarRecepcion && (
                            <button onClick={() => onConfirmarRecepcion(enc)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Confirmar Recepción
                            </button>
                          )}
                          {enc.estado === 'EN_DESTINO' && destino && onEntregar && (
                            <button onClick={() => onEntregar(enc)} style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Entregar
                            </button>
                          )}
                          {(enc.estado === 'EN_TRANSITO' || enc.estado === 'EN_DESTINO') && onDevolver && (
                            <button onClick={() => onDevolver(enc)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Marcar Devuelta
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              Mostrando <strong style={{ color: '#475569' }}>{encomiendas.length}</strong> de{' '}
              <strong style={{ color: '#475569' }}>{totalRegistros}</strong> encomiendas
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => onPageChange(page - 1)} />
              {visiblePages.map((p, i) => p === '...'
                ? <span key={`d${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>...</span>
                : <PagBtn key={p} label={String(p)} active={p === page} onClick={() => onPageChange(p as number)} />
              )}
              <NavArrow icon="chevron_right" disabled={page === totalPaginas || totalPaginas === 0} onClick={() => onPageChange(page + 1)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
