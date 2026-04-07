import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useRutas } from '../../hooks/useRutas';
import { useAgencias } from '../../hooks/useAgencias';
import type { Ruta } from '../../../domain/entities/Ruta';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

/* ─── Status badge ────────────────────────────────────────── */
function EstadoBadge({ activa }: { activa: boolean }) {
  const bg = activa ? '#dcfce7' : '#fee2e2';
  const color = activa ? '#15803d' : '#dc2626';
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: bg, color, fontSize: '11.5px', fontWeight: 700 }}>
      {activa ? 'Activo' : 'Inactivo'}
    </span>
  );
}

/* ─── Pagination ──────────────────────────────────────────── */
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

/* ─── Field ───────────────────────────────────────────────── */
function Field({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        {optional && <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'none', fontWeight: 400 }}> (Opcional)</span>}
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

/* ═══════════════════════════════════════════════════════════ */
export const RutasPage = () => {
  const { rutas, isLoading, create, update, remove } = useRutas();
  const { agencias } = useAgencias();
  const agenciasList = Array.isArray(agencias) ? agencias : [];

  const [modoTarifa, setModoTarifa] = useState<'normal' | 'alto'>('normal');

  /* ── form ────────────────────────────────────────────────── */
  const [nombre, setNombre] = useState('');
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [duracion, setDuracion] = useState('');
  const [distancia, setDistancia] = useState('');
  const [via, setVia] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── table ───────────────────────────────────────────────── */
  const [page, setPage] = useState(1);
  const list = useMemo(() => Array.isArray(rutas) ? rutas : [], [rutas]);
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

  const agName = (id: string) => agenciasList.find((a: any) => a.idagencia === parseInt(id))?.nombre ?? id;

  // Agrupar rutas por ID para mostrar visualmente
  const groupedRoutes = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    paginated.forEach(ruta => {
      if (!groups[ruta.id]) {
        groups[ruta.id] = [];
      }
      groups[ruta.id].push(ruta);
    });
    return groups;
  }, [paginated]);

  const resetForm = () => { setNombre(''); setOrigenId(''); setDestinoId(''); setDuracion(''); setDistancia(''); setVia(''); setEditingId(null); };

  const startEdit = (r: Ruta) => {
    setEditingId(r.id);
    setNombre(r.nombre || '');
    setOrigenId(r.origen);
    setDestinoId(r.destino);
    setDuracion(String(r.duracionMinutos));
    setDistancia(String(r.precioBase));
    setVia('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !origenId || !destinoId) { setFormMsg({ type: 'err', text: 'Nombre, origen y destino son requeridos.' }); return; }
    const payload = { nombre, origen: origenId, destino: destinoId, duracionMinutos: Number(duracion) || 0, precioBase: Number(distancia) || 0, activa: true };
    const cb = {
      onSuccess: () => { setFormMsg({ type: 'ok', text: editingId ? 'Ruta actualizada.' : 'Ruta guardada.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
      onError: () => { setFormMsg({ type: 'err', text: 'Error al guardar.' }); setTimeout(() => setFormMsg(null), 3000); },
    };
    editingId ? update.mutate({ id: editingId, data: payload }, cb) : create.mutate(payload, cb);
  };

  const handleDelete = (id: string) => { if (window.confirm('¿Eliminar esta ruta?')) remove.mutate(id); };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Modo Global de Tarifas (header row) ────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Modo Global de Tarifas:
        </span>
        {(['normal', 'alto'] as const).map(m => (
          <button key={m} onClick={() => setModoTarifa(m)} style={{
            padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none',
            background: modoTarifa === m ? BLUE : '#f1f5f9', color: modoTarifa === m ? 'white' : '#64748b',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
            {m === 'normal' ? 'Tráfico Normal' : 'Tráfico Alto'}
          </button>
        ))}
      </div>

      {/* ── Formulario Nueva Ruta ──────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px', border: '1px solid #e8edf2',
        padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>add_road</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            {editingId ? 'Editar Ruta' : 'Añadir Nueva Ruta'}
          </span>
        </div>

        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <Field label="Nombre de la Ruta" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Pasto - Cali" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Agencia Origen" required>
              <select value={origenId} onChange={e => setOrigenId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar Agencia...</option>
                {agenciasList.map((a: any) => <option key={a.idagencia} value={a.idagencia}>{a.nombre}</option>)}
              </select>
            </Field>
            <Field label="Agencia Destino" required>
              <select value={destinoId} onChange={e => setDestinoId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar Agencia...</option>
                {agenciasList.map((a: any) => <option key={a.idagencia} value={a.idagencia}>{a.nombre}</option>)}
              </select>
            </Field>
            <Field label="Duración Aproximada" required>
              <div style={{ position: 'relative' }}>
                <input value={duracion} onChange={e => setDuracion(e.target.value)} placeholder="Ej: 4h 30m"
                  style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8', pointerEvents: 'none' }}>schedule</span>
              </div>
            </Field>
            <Field label="Distancia en km" required>
              <div style={{ position: 'relative' }}>
                <input value={distancia} onChange={e => setDistancia(e.target.value)} placeholder="Ej: 120"
                  style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>km</span>
              </div>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            <Field label="Vía / Observaciones" optional>
              <input value={via} onChange={e => setVia(e.target.value)} placeholder="Ej: Vía Panamericana"
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{
                display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#64748b',
                border: '1px solid #cbd5e1', borderRadius: '7px', padding: '10px 16px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span> Cancelar
              </button>
            )}
            <button type="submit" style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white',
              border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingId ? 'edit' : 'save'}</span>
              {editingId ? 'Actualizar Ruta' : 'Guardar Ruta'}
            </button>
          </div>
          {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
        </form>
      </div>

      {/* ── Tabla de Rutas ─────────────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px', border: '1px solid #e8edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: BLUE }}>list</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Listado de Rutas</span>
          </div>
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
            <span style={{ fontSize: '13px' }}>Cargando rutas...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'Código Ruta', w: '100px' }, 
                    { label: 'Agencia Origen', w: '140px' },
                    { label: 'Agencia Destino', w: '140px' },
                    { label: 'Tipo de Bus', w: '120px' },
                    { label: 'Duración', w: '80px' },
                    { label: 'Distancia', w: '80px' }, 
                    { label: 'Precio Normal', w: '110px' },
                    { label: 'Precio Tráfico Alto', w: '130px' },
                    { label: 'Estado', w: '70px' },
                    { label: 'Acciones', w: '90px' },
                  ].map(({ label, w }) => (
                    <th key={label} style={{
                      width: w, padding: '11px 16px', 
                      textAlign: label === 'Duración' || label === 'Distancia' || label === 'Estado' || label === 'Precio Normal' || label === 'Precio Tráfico Alto' ? 'center' : 'left',
                      fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', background: '#f8fafc',
                    }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedRoutes).length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron rutas.</td></tr>
                ) : Object.entries(groupedRoutes).map(([rutaId, rutasGrupo], groupIdx) => {
                  return rutasGrupo.map((r, idx) => {
                    const isFirstInGroup = idx === 0;
                    const groupSize = rutasGrupo.length;
                    
                    return (
                      <tr 
                        key={`${r.id}-${r.idTipoBus || 'sin-tarifa'}-${idx}`} 
                        style={{ 
                          borderBottom: idx === groupSize - 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? 'white' : '#fafbfc'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafbfc')}
                      >
                        {isFirstInGroup ? (
                          <td 
                            rowSpan={groupSize} 
                            style={{ 
                              padding: '12px 16px', 
                              fontSize: '13px', 
                              fontWeight: 600, 
                              color: '#64748b', 
                              fontFamily: 'monospace',
                              borderRight: '1px solid #e8edf2',
                              background: '#f8fafc'
                            }}
                          >
                            #R-{String(groupIdx + 1 + (page - 1) * ITEMS_PER_PAGE).padStart(3, '0')}
                          </td>
                        ) : null}
                        
                        {isFirstInGroup ? (
                          <td rowSpan={groupSize} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderRight: '1px solid #e8edf2' }}>
                            {agName(r.origen)}
                          </td>
                        ) : null}
                        
                        {isFirstInGroup ? (
                          <td rowSpan={groupSize} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderRight: '1px solid #e8edf2' }}>
                            {agName(r.destino)}
                          </td>
                        ) : null}
                        
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                          {(r as any).tipoBus || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Sin tarifa</span>}
                        </td>
                        
                        {isFirstInGroup ? (
                          <td rowSpan={groupSize} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center', borderRight: '1px solid #e8edf2' }}>
                            {Math.floor(r.duracionMinutos / 60)}h {r.duracionMinutos % 60 > 0 ? `${r.duracionMinutos % 60}m` : '00m'}
                          </td>
                        ) : null}
                        
                        {isFirstInGroup ? (
                          <td rowSpan={groupSize} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center', borderRight: '1px solid #e8edf2' }}>
                            {r.precioBase} km
                          </td>
                        ) : null}
                        
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#16a34a', textAlign: 'center' }}>
                          {(r as any).precioNormal ? `$${Number((r as any).precioNormal).toLocaleString()}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#dc2626', textAlign: 'center' }}>
                          {(r as any).precioTraficoAlto ? `$${Number((r as any).precioTraficoAlto).toLocaleString()}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        
                        {isFirstInGroup ? (
                          <td rowSpan={groupSize} style={{ padding: '12px 16px', textAlign: 'center', borderRight: '1px solid #e8edf2' }}>
                            <EstadoBadge activa={r.activa} />
                          </td>
                        ) : null}
                        
                        {isFirstInGroup ? (
                          <td rowSpan={groupSize} style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                              <button title="Editar" onClick={() => startEdit(r)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              </button>
                              <button title="Eliminar" onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando <strong style={{ color: '#475569' }}>{list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}</strong> a{' '}
                <strong style={{ color: '#475569' }}>{Math.min(page * ITEMS_PER_PAGE, list.length)}</strong> de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong> rutas
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
