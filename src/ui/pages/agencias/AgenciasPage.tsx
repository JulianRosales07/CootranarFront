import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useAgencias } from '../../hooks/useAgencias';
import { useCiudades } from '../../hooks/useCiudades';

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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px',
  color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit',
};

export const AgenciasPage = () => {
  const { agencias, isLoading, createAgencia, updateAgencia, deleteAgencia } = useAgencias();
  const { ciudades } = useCiudades();
  const ciudadesList = Array.isArray(ciudades) ? ciudades : [];
  const agenciasList = useMemo(() => Array.isArray(agencias) ? agencias : [], [agencias]);

  const [nombre, setNombre] = useState('');
  const [ciudadId, setCiudadId] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  const list = useMemo(() => {
    if (filterEstado === 'TODOS') return agenciasList;
    return agenciasList.filter((a: any) => filterEstado === 'ACTIVO' ? a.activo : !a.activo);
  }, [agenciasList, filterEstado]);

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

  const ciudadName = (id: string) => ciudadesList.find((c: any) => c.id === parseInt(id))?.nombre ?? id;

  const resetForm = () => { setNombre(''); setCiudadId(''); setDireccion(''); setTelefono(''); setActivo(true); setEditingId(null); };

  const startEdit = (a: any) => {
    setEditingId(a.idagencia);
    setNombre(a.nombre);
    setCiudadId(a.idciudad ? String(a.idciudad) : '');
    setDireccion(a.direccion || '');
    setTelefono(a.telefono || '');
    setActivo(a.activo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setFormMsg({ type: 'err', text: 'El nombre es requerido.' }); return; }
    const payload = { nombre, ciudadId, direccion, telefono, activo };
    const onOk = () => { setFormMsg({ type: 'ok', text: editingId ? 'Agencia actualizada.' : 'Agencia guardada.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); };
    const onErr = (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Error al guardar.';
      setFormMsg({ type: 'err', text: msg });
      setTimeout(() => setFormMsg(null), 5000);
    };
    editingId ? updateAgencia({ id: editingId, data: payload }, { onSuccess: onOk, onError: onErr } as any) : createAgencia(payload, { onSuccess: onOk, onError: onErr } as any);
  };

  const handleDelete = (id: string) => { if (window.confirm('¿Eliminar esta agencia?')) deleteAgencia(id); };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Formulario ─────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>store</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{editingId ? 'Editar Agencia' : 'Registrar Nueva Agencia'}</span>
        </div>
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Nombre" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Terminal Pasto" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Ciudad">
              <select value={ciudadId} onChange={e => setCiudadId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar Ciudad...</option>
                {ciudadesList.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Dirección">
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>location_on</span>
                <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej. Calle 18 #25-30" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </Field>
            <Field label="Teléfono">
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>call</span>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej. 602 723 4567" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </Field>
            {editingId && (
              <Field label="Estado">
                <select value={activo ? 'true' : 'false'} onChange={e => setActivo(e.target.value === 'true')} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </Field>
            )}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span> Cancelar
              </button>
            )}
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingId ? 'edit' : 'save'}</span>
              {editingId ? 'Actualizar Agencia' : 'Guardar Agencia'}
            </button>
          </div>
          {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
        </form>
      </div>

      {/* ── Tabla ───────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Agencias Registradas</span>
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

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando agencias...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[{ l: 'Nombre', w: '200px' }, { l: 'Ciudad', w: '180px' }, { l: 'Dirección', w: '250px' }, { l: 'Teléfono', w: '140px' }, { l: 'Estado', w: '90px' }, { l: 'Acciones', w: '80px' }].map(({ l, w }) => (
                    <th key={l} style={{ width: w, padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron agencias.</td></tr>
                ) : paginated.map((a: any) => (
                  <tr key={a.idagencia} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{a.nombre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{a.nombreciudad || ciudadName(a.idciudad) || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{a.direccion || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{a.telefono || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge activo={a.activo} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button title="Editar" onClick={() => startEdit(a)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                        <button title="Eliminar" onClick={() => handleDelete(a.idagencia)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span></button>
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
                <strong style={{ color: '#475569' }}>{list.length}</strong> agencias
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
