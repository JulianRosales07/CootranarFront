import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useRutas } from '../../hooks/useRutas';
import { useTarifasRuta } from '../../hooks/useTarifasRuta';
import { useTiposBus } from '../../hooks/useTiposBus';
import { useAgencias } from '../../hooks/useAgencias';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

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

export const TarifasRutaPage = () => {
  const { rutas } = useRutas();
  const { tiposBus } = useTiposBus();
  const { agencias } = useAgencias();
  const rutasList = useMemo(() => Array.isArray(rutas) ? rutas : [], [rutas]);
  const tiposBusList = Array.isArray(tiposBus) ? tiposBus : [];
  const agenciasList = Array.isArray(agencias) ? agencias : [];

  const [selectedRutaId, setSelectedRutaId] = useState('');
  const { tarifas, isLoading, create, update, remove } = useTarifasRuta(selectedRutaId || undefined);

  const [tipoBusId, setTipoBusId] = useState('');
  const [precio, setPrecio] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [page, setPage] = useState(1);

  const list = useMemo(() => Array.isArray(tarifas) ? tarifas : [], [tarifas]);
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

  const agName = (id: string) => agenciasList.find(a => a.id === id)?.nombre ?? id;
  const rutaLabel = (r: typeof rutasList[0]) => `${agName(r.origen)} → ${agName(r.destino)}`;

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  const resetForm = () => { setTipoBusId(''); setPrecio(''); setEditingId(null); };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRutaId) { setFormMsg({ type: 'err', text: 'Selecciona una ruta primero.' }); return; }
    if (!tipoBusId || !precio) { setFormMsg({ type: 'err', text: 'Tipo de bus y precio son requeridos.' }); return; }
    const payload = { idRuta: selectedRutaId, idTipoBus: tipoBusId, precio: Number(precio) };
    const cb = {
      onSuccess: () => { setFormMsg({ type: 'ok', text: editingId ? 'Tarifa actualizada.' : 'Tarifa creada.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
      onError: () => { setFormMsg({ type: 'err', text: 'Error al guardar tarifa.' }); setTimeout(() => setFormMsg(null), 3000); },
    };
    editingId ? update.mutate({ id: editingId, data: payload }, cb) : create.mutate(payload, cb);
  };

  const handleDelete = (id: string) => { if (window.confirm('¿Eliminar esta tarifa?')) remove.mutate(id); };

  return (
    <Layout>
      {/* ── Selector de Ruta ───────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>payments</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Configuración de Tarifas por Ruta</span>
        </div>
        <Field label="Seleccionar Ruta" required>
          <select value={selectedRutaId} onChange={e => { setSelectedRutaId(e.target.value); resetForm(); setPage(1); }}
            style={{ ...inputStyle, appearance: 'none', maxWidth: '500px' }} onFocus={focusBorder} onBlur={blurBorder}>
            <option value="">Seleccionar una ruta...</option>
            {rutasList.map(r => <option key={r.id} value={r.id}>{rutaLabel(r)}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Formulario de Tarifa ───────────────────────────── */}
      {selectedRutaId && (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>add_circle</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{editingId ? 'Editar Tarifa' : 'Agregar Tarifa'}</span>
          </div>
          <form onSubmit={handleGuardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Tipo de Bus" required>
                <select value={tipoBusId} onChange={e => setTipoBusId(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                  <option value="">Seleccionar tipo de bus...</option>
                  {tiposBusList.map(tb => <option key={tb.id} value={tb.id}>{tb.nombre}</option>)}
                </select>
              </Field>
              <Field label="Precio ($)" required>
                <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej: 45000"
                  style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
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
                {editingId ? 'Actualizar Tarifa' : 'Guardar Tarifa'}
              </button>
            </div>
            {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
          </form>
        </div>
      )}

      {/* ── Tabla de Tarifas ───────────────────────────────── */}
      {selectedRutaId && (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Tarifas Configuradas</span>
          </div>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
              <span style={{ fontSize: '13px' }}>Cargando tarifas...</span>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Tipo de Bus', 'Precio', 'Acciones'].map(l => (
                      <th key={l} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2' }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No hay tarifas configuradas para esta ruta.</td></tr>
                  ) : paginated.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{t.tipoBusNombre || tiposBusList.find(tb => tb.id === t.idTipoBus)?.nombre || t.idTipoBus}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>${t.precio.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => { setEditingId(t.id); setTipoBusId(t.idTipoBus); setPrecio(String(t.precio)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                            onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button onClick={() => handleDelete(t.id)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
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
                  <strong style={{ color: '#475569' }}>{list.length}</strong> tarifas
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
      )}

      {!selectedRutaId && (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}>payments</span>
          <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Selecciona una ruta para ver y configurar sus tarifas</p>
        </div>
      )}
    </Layout>
  );
};
