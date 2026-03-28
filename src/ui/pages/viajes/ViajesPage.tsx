import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useViajes } from '../../hooks/useViajes';
import { useRutas } from '../../hooks/useRutas';
import { useAgencias } from '../../hooks/useAgencias';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PROGRAMADO: { bg: '#fef3c7', color: '#b45309' },
    EN_CURSO: { bg: '#dbeafe', color: '#1d4ed8' },
    COMPLETADO: { bg: '#dcfce7', color: '#15803d' },
    CANCELADO: { bg: '#fee2e2', color: '#dc2626' },
  };
  const c = map[estado] || { bg: '#f1f5f9', color: '#475569' };
  return <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: c.bg, color: c.color, fontSize: '11.5px', fontWeight: 700 }}>{estado}</span>;
}

function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ minWidth: '30px', height: '30px', padding: '0 6px', border: `1px solid ${active ? BLUE : '#e2e8f0'}`, borderRadius: '6px', background: active ? BLUE : 'white', color: active ? 'white' : '#475569', fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>;
}
function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return <button onClick={onClick} disabled={disabled} style={{ width: '30px', height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', color: disabled ? '#cbd5e1' : '#475569' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span></button>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit' };
const fmtDate = (d: Date | string) => { try { return new Date(d).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return '—'; } };

export const ViajesPage = () => {
  const { viajes, isLoading } = useViajes();
  const { rutas } = useRutas();
  const { agencias } = useAgencias();
  const viajesList = useMemo(() => Array.isArray(viajes) ? viajes : [], [viajes]);
  const rutasList = useMemo(() => Array.isArray(rutas) ? rutas : [], [rutas]);
  const agenciasList = useMemo(() => Array.isArray(agencias) ? agencias : [], [agencias]);

  const [codigoViaje] = useState(() => `VJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [sucursalOrigen, setSucursalOrigen] = useState('');
  const [rutaId, setRutaId] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [hora, setHora] = useState('');

  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  const list = useMemo(() => {
    if (filterEstado === 'TODOS') return viajesList;
    return viajesList.filter(v => v.estado === filterEstado);
  }, [viajesList, filterEstado]);

  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const paginated = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const visiblePages = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p: (number | '...')[] = [1];
    if (page > 3) p.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) p.push(i);
    if (page < totalPages - 2) p.push('...');
    p.push(totalPages);
    return p;
  })();

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Formulario Programar Nuevo Viaje ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '18px 24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>add_circle</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Programar Nuevo Viaje</span>
        </div>
        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <Field label="Código de Viaje">
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#94a3b8' }}>tag</span>
              <input value={codigoViaje} readOnly style={{ ...inputStyle, paddingLeft: '30px', width: '140px', background: '#f8fafc', color: '#94a3b8' }} />
            </div>
          </Field>
          <Field label="Sucursal de Origen">
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#94a3b8' }}>store</span>
              <select value={sucursalOrigen} onChange={e => setSucursalOrigen(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '160px', appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                {agenciasList.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Ruta">
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#94a3b8' }}>route</span>
              <select value={rutaId} onChange={e => setRutaId(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '160px', appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                {rutasList.map(r => <option key={r.id} value={r.id}>{r.origen} → {r.destino}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Vehículo (Móvil)">
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#94a3b8' }}>directions_bus</span>
              <input value={vehiculo} onChange={e => setVehiculo(e.target.value)} placeholder="# Móvil" style={{ ...inputStyle, paddingLeft: '30px', width: '130px' }} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </Field>
          <Field label="Fecha Salida">
            <input type="date" value={fechaSalida} onChange={e => setFechaSalida(e.target.value)} style={{ ...inputStyle, width: '140px' }} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>
          <Field label="Hora">
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={{ ...inputStyle, width: '100px' }} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span> Programar
          </button>
        </form>
      </div>

      {/* ── Tabla de Viajes ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>directions_bus</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Viajes Registrados</span>
          </div>
          <div style={{ position: 'relative' }}>
            <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
              style={{ padding: '7px 32px 7px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', background: 'white', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', outline: 'none' }}>
              <option value="TODOS">Todos los Estados</option>
              <option value="PROGRAMADO">Programado</option>
              <option value="EN_CURSO">En Curso</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8', pointerEvents: 'none' }}>expand_more</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando viajes...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[{ l: 'Fecha Salida', w: '200px' }, { l: 'Fecha Llegada Est.', w: '200px' }, { l: 'Asientos Disp.', w: '120px' }, { l: 'Estado', w: '130px' }].map(({ l, w }) => (
                    <th key={l} style={{ width: w, padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron viajes.</td></tr>
                ) : paginated.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{fmtDate(v.fechaSalida)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{fmtDate(v.fechaLlegadaEstimada)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{v.asientosDisponibles}</td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge estado={v.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando <strong style={{ color: '#475569' }}>{list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}</strong> a{' '}
                <strong style={{ color: '#475569' }}>{Math.min(page * ITEMS_PER_PAGE, list.length)}</strong> de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong> viajes
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                {visiblePages.map((p, i) => p === '...'
                  ? <span key={`d${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>...</span>
                  : <PagBtn key={p} label={String(p)} active={p === page} onClick={() => setPage(p as number)} />
                )}
                <NavArrow icon="chevron_right" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
