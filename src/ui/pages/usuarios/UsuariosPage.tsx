import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useTaquilleros } from '../../hooks/useTaquilleros';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: activo ? '#dcfce7' : '#fee2e2', color: activo ? '#15803d' : '#dc2626', fontSize: '11.5px', fontWeight: 700 }}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ minWidth: '30px', height: '30px', padding: '0 6px', border: `1px solid ${active ? BLUE : '#e2e8f0'}`, borderRadius: '6px', background: active ? BLUE : 'white', color: active ? 'white' : '#475569', fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>;
}
function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return <button onClick={onClick} disabled={disabled} style={{ width: '30px', height: '30px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', color: disabled ? '#cbd5e1' : '#475569' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span></button>;
}

export const UsuariosPage = () => {
  const { taquilleros, isLoading, activar } = useTaquilleros();
  const usuariosList = useMemo(() => Array.isArray(taquilleros) ? taquilleros : [], [taquilleros]);

  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  const list = useMemo(() => {
    let filtered = usuariosList;
    if (filterEstado === 'ACTIVO') filtered = filtered.filter(u => u.estado);
    if (filterEstado === 'INACTIVO') filtered = filtered.filter(u => !u.estado);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.nombre?.toLowerCase().includes(q) ||
        u.apellido?.toLowerCase().includes(q) ||
        u.correo?.toLowerCase().includes(q) ||
        u.documento?.includes(q)
      );
    }
    return filtered;
  }, [usuariosList, filterEstado, search]);

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

  const handleActivar = (idusuario: number) => { activar.mutate(idusuario); };

  return (
    <Layout>
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>manage_accounts</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Usuarios del Sistema</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>search</span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar usuario..."
                style={{ padding: '7px 12px 7px 34px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit', width: '200px' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
                style={{ padding: '7px 32px 7px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', background: 'white', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', outline: 'none' }}>
                <option value="TODOS">Todos los Estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8', pointerEvents: 'none' }}>expand_more</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando usuarios...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[{ l: 'Nombre', w: '200px' }, { l: 'Correo', w: '200px' }, { l: 'Documento', w: '120px' }, { l: 'Teléfono', w: '120px' }, { l: 'Oficina', w: '120px' }, { l: 'Estado', w: '90px' }, { l: 'Acciones', w: '80px' }].map(({ l, w }) => (
                    <th key={l} style={{ width: w, padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron usuarios.</td></tr>
                ) : paginated.map(u => (
                  <tr key={u.idusuario} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{u.nombre} {u.apellido}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{u.correo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{u.documento || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{u.telefono || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{u.oficina_codigo || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge activo={u.estado} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      {!u.estado && (
                        <button title="Activar" onClick={() => handleActivar(u.idusuario)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onMouseEnter={e => (e.currentTarget.style.color = '#16a34a')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando <strong style={{ color: '#475569' }}>{list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}</strong> a{' '}
                <strong style={{ color: '#475569' }}>{Math.min(page * ITEMS_PER_PAGE, list.length)}</strong> de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong> usuarios
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
