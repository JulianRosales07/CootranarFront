import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useDespachos } from '../../hooks/useDespachos';
import { useEncomiendas } from '../../hooks/useEncomiendas';
import { useMiOficinaEncomienda } from '../../hooks/useMiOficinaEncomienda';
import { CrearDespachoModal } from '../../components/despachos/CrearDespachoModal';
import type { EstadoDespacho } from '../../../application/dto/DespachoDTO';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 10;

const ESTADOS: { value: EstadoDespacho; label: string; bg: string; color: string }[] = [
  { value: 'PROGRAMADO', label: 'Programado', bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'EN_RUTA', label: 'En Ruta', bg: '#fef9c3', color: '#a16207' },
  { value: 'LLEGADO', label: 'Llegado', bg: '#dcfce7', color: '#15803d' },
];

function EstadoBadge({ estado }: { estado: EstadoDespacho }) {
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
    return new Date(fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export const DespachosPage = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);

  const { despachos, paginacion, isLoading, crear, confirmarSalida, confirmarLlegada } =
    useDespachos({ estado: filtroEstado, page, limit: ITEMS_PER_PAGE });
  const { idOficinaOrigen } = useMiOficinaEncomienda();
  // Encomiendas REGISTRADA disponibles para armar un nuevo despacho.
  const { encomiendas: encomiendasRegistradas } = useEncomiendas({ estado: 'REGISTRADA', limit: 100 });

  const handleCrear = (data: { idOficinaDestino: string; idVehiculo: string; idConductor: string; idsEncomienda: string[]; fechaProgramada?: string }) => {
    crear.mutate(data, {
      onSuccess: () => setModalAbierto(false),
      onError: (err: any) => {
        alert(err?.response?.data?.message || err?.message || 'Error al crear el despacho.');
      },
    });
  };

  const handleConfirmarSalida = (id: string) => {
    confirmarSalida.mutate(id, {
      onError: (err: any) => alert(err?.response?.data?.message || err?.message || 'Error al confirmar la salida.'),
    });
  };

  const handleConfirmarLlegada = (id: string) => {
    confirmarLlegada.mutate(id, {
      onError: (err: any) => alert(err?.response?.data?.message || err?.message || 'Error al confirmar la llegada.'),
    });
  };

  const totalPaginas = paginacion?.totalPaginas || 1;
  const visiblePages = (() => {
    if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const p: (number | '...')[] = [1];
    if (page > 3) p.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPaginas - 1, page + 1); i++) p.push(i);
    if (page < totalPaginas - 2) p.push('...');
    p.push(totalPaginas);
    return p;
  })();

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Gestión de Despachos</h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
            Agrupa encomiendas registradas en despachos, confirma su salida y llegada.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_shipping</span>
          Crear Despacho
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Despachos</span>
          <select
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
            style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', color: '#334155', outline: 'none', fontFamily: 'inherit', background: 'white' }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(es => <option key={es.value} value={es.value}>{es.label}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando despachos...</span>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Código', 'Origen', 'Destino', 'Vehículo', 'Conductor', 'Encomiendas', 'Estado', 'Programado', 'Acciones'].map(l => (
                      <th key={l} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap' }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {despachos.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron despachos.</td></tr>
                  ) : despachos.map((d: any) => {
                    const esOrigen = idOficinaOrigen && d.idOficinaOrigen === idOficinaOrigen;
                    const esDestino = idOficinaOrigen && d.idOficinaDestino === idOficinaOrigen;
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '12px 16px', fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>{d.codigoDespacho}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{d.oficinaOrigenNombre || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{d.oficinaDestinoNombre || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{d.placa || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{d.nombreConductor || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{d.totalEncomiendas}</td>
                        <td style={{ padding: '12px 16px' }}><EstadoBadge estado={d.estado} /></td>
                        <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatearFecha(d.fechaProgramada)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {d.estado === 'PROGRAMADO' && esOrigen && (
                              <button onClick={() => handleConfirmarSalida(d.id)} style={{ background: '#fef9c3', color: '#a16207', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Confirmar Salida
                              </button>
                            )}
                            {d.estado === 'EN_RUTA' && esDestino && (
                              <button onClick={() => handleConfirmarLlegada(d.id)} style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Confirmar Llegada
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
                Mostrando <strong style={{ color: '#475569' }}>{despachos.length}</strong> de{' '}
                <strong style={{ color: '#475569' }}>{paginacion?.total || 0}</strong> despachos
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: '30px', height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: page === 1 ? 'default' : 'pointer', color: page === 1 ? '#cbd5e1' : '#475569' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>
                {visiblePages.map((p, i) => p === '...'
                  ? <span key={`d${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>...</span>
                  : (
                    <button key={p} onClick={() => setPage(p as number)} style={{
                      minWidth: '30px', height: '30px', padding: '0 6px', border: `1px solid ${p === page ? BLUE : '#e2e8f0'}`,
                      borderRadius: '6px', background: p === page ? BLUE : 'white', color: p === page ? 'white' : '#475569',
                      fontSize: '13px', fontWeight: p === page ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit',
                    }}>{p}</button>
                  )
                )}
                <button onClick={() => setPage(p => Math.min(totalPaginas, p + 1))} disabled={page === totalPaginas} style={{ width: '30px', height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: page === totalPaginas ? 'default' : 'pointer', color: page === totalPaginas ? '#cbd5e1' : '#475569' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CrearDespachoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        encomiendasDisponibles={encomiendasRegistradas}
        idOficinaOrigen={idOficinaOrigen}
        cargando={crear.isPending}
        onCrear={handleCrear}
      />
    </Layout>
  );
};
