import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useTiposServicio } from '../../hooks/useTiposServicio';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

function EstadoBadge({ activo }: { activo: boolean }) {
  return <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: activo ? '#dcfce7' : '#fee2e2', color: activo ? '#15803d' : '#dc2626', fontSize: '11.5px', fontWeight: 700 }}>{activo ? 'Activo' : 'Inactivo'}</span>;
}
function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ minWidth: '30px', height: '30px', padding: '0 6px', border: `1px solid ${active ? BLUE : '#e2e8f0'}`, borderRadius: '6px', background: active ? BLUE : 'white', color: active ? 'white' : '#475569', fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>;
}
function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return <button onClick={onClick} disabled={disabled} style={{ width: '30px', height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', color: disabled ? '#cbd5e1' : '#475569' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span></button>;
}
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit' };

export const TiposServicioPage = () => {
  const { tiposServicio, isLoading } = useTiposServicio();
  const tiposList = useMemo(() => Array.isArray(tiposServicio) ? tiposServicio : [], [tiposServicio]);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  const list = useMemo(() => {
    if (filterEstado === 'TODOS') return tiposList;
    return tiposList.filter(t => filterEstado === 'ACTIVO' ? t.activo : !t.activo);
  }, [tiposList, filterEstado]);

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

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Formulario Añadir Nuevo Tipo de Servicio ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '18px' }}>Añadir Nuevo Tipo de Servicio</span>
        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Nombre</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>label</span>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Corriente, Expresso, Directo" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>
          <div style={{ flex: 1.5 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Descripción</label>
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Detalles del servicio..." style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span> Guardar Servicio
          </button>
        </form>
      </div>

      {/* ── Listado de Tipos de Servicio ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Listado de Tipos de Servicio</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>filter_alt</span> Filtrar
            </button>
            <button style={{ padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>download</span> Exportar
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando tipos de servicio...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[{ l: 'ID', w: '100px' }, { l: 'Nombre', w: '160px' }, { l: 'Descripción', w: '350px' }, { l: 'Estado', w: '100px' }, { l: 'Acciones', w: '100px' }].map(({ l, w }) => (
                    <th key={l} style={{ width: w, padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron tipos de servicio.</td></tr>
                ) : paginated.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>#TS{String(idx + 1 + (page - 1) * ITEMS_PER_PAGE).padStart(3, '0')}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{t.nombre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.descripcion || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge activo={t.activo} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button title="Editar" style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: BLUE, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                        </button>
                        <button title="Eliminar" style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando <strong style={{ color: '#475569' }}>{list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}</strong> a{' '}
                <strong style={{ color: '#475569' }}>{Math.min(page * ITEMS_PER_PAGE, list.length)}</strong> de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong> resultados
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
