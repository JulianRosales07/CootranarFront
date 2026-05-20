import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useRutas } from '../../hooks/useRutas';
import { useAgencias } from '../../hooks/useAgencias';
import { EstadoPrecioToggle } from '../../components/common/EstadoPrecioToggle';
import { useConfiguracionSistema } from '../../hooks/useConfiguracionSistema';
import type { Ruta } from '../../../domain/entities/Ruta';
import { PuntosIntermedios } from '../../components/rutas/PuntosIntermedios';
import type { PuntoIntermedio } from '../../components/rutas/PuntosIntermedios';
import { FilaPuntosExpandidos } from '../../components/rutas/FilaPuntosExpandidos';
import { rutasApi } from '../../../infrastructure/services/rutasApi';

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

let nextTempId = 1;
const puntoVacio = (): PuntoIntermedio => ({
  _id: nextTempId++,
  nombre: '',
  esAgencia: false,
  idagencia: null,
  tiempodesdeanteriorth: 0,
  tiempodesdeanteriorm: 0,
});

/* ═══════════════════════════════════════════════════════════ */
export const RutasPage = () => {
  const { rutas, isLoading, create, update, remove, toggleEstado } = useRutas();
  const { agencias } = useAgencias();
  const { esTraficoAlto } = useConfiguracionSistema();
  const agenciasList = Array.isArray(agencias) ? agencias : [];

  // Debug: verificar que las agencias se están cargando
  useEffect(() => {
    console.log('Agencias en RutasPage:', agenciasList);
  }, [agenciasList]);

  /* ── form ────────────────────────────────────────────────── */
  const [nombre, setNombre] = useState('');
  const [tiporuta, setTiporuta] = useState('INTERMUNICIPAL');
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [duracionh, setDuracionh] = useState('');
  const [duracionm, setDuracionm] = useState('');
  const [distancia, setDistancia] = useState('');
  const [via, setVia] = useState('');
  const [puntos, setPuntos] = useState<PuntoIntermedio[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── table expansion ─────────────────────────────────────── */
  const [expandido, setExpandido] = useState<string | null>(null);
  const [puntosExpandidos, setPuntosExpandidos] = useState<any[]>([]);

  /* ── table grouping & pagination ───────────────────────────── */
  const list = useMemo(() => Array.isArray(rutas) ? rutas : [], [rutas]);
  
  // 1. Agrupar TODAS las rutas primero
  const allGroupedRoutes = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    list.forEach(ruta => {
      if (!groups[ruta.id]) groups[ruta.id] = [];
      groups[ruta.id].push(ruta);
    });
    return Object.values(groups);
  }, [list]);

  // 2. Paginar sobre los grupos (rutas únicas), no sobre los registros planos
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(allGroupedRoutes.length / ITEMS_PER_PAGE));
  const paginatedGroups = useMemo(() => {
    return allGroupedRoutes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [allGroupedRoutes, page]);

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

  /* ── handlers ────────────────────────────────────────────── */
  const resetForm = () => {
    setNombre(''); setTiporuta('INTERMUNICIPAL'); setOrigenId(''); setDestinoId('');
    setDuracionh(''); setDuracionm(''); setDistancia(''); setVia('');
    setPuntos([]); setEditingId(null);
  };

  const startEdit = async (r: Ruta) => {
    setEditingId(r.id);
    setNombre(r.nombre || '');
    setTiporuta(r.tiporuta || 'INTERMUNICIPAL');
    setOrigenId(r.origen);
    setDestinoId(r.destino);
    setDuracionh(r.duracionh !== undefined ? String(r.duracionh) : String(Math.floor(r.duracionMinutos / 60)));
    setDuracionm(r.duracionm !== undefined ? String(r.duracionm) : String(r.duracionMinutos % 60));
    setDistancia(r.distanciakm !== undefined && r.distanciakm !== null ? String(r.distanciakm) : String(r.precioBase));
    setVia(r.via || '');

    try {
      const res = await rutasApi.obtenerPuntos(r.id);
      const todosLosPuntos = res.data?.puntos || res.data?.data?.puntos || [];
      const intermedios = todosLosPuntos
        .filter((p: any) => p.orden !== 0 && p.orden !== Math.max(...todosLosPuntos.map((x: any) => x.orden)))
        .sort((a: any, b: any) => a.orden - b.orden)
        .map((p: any) => ({
          _id: nextTempId++,
          nombre: p.idagencia ? '' : p.nombre,
          esAgencia: !!p.idagencia,
          idagencia: p.idagencia ? p.idagencia.toString() : null,
          tiempodesdeanteriorth: p.tiempodesdeanteriorth ?? 0,
          tiempodesdeanteriorm: p.tiempodesdeanteriorm ?? 0,
        }));
      setPuntos(intermedios);
    } catch {
      setPuntos([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPuntosPayload = () => {
    const origenAg = agenciasList.find((a: any) => a.idagencia === parseInt(origenId));
    const destinoAg = agenciasList.find((a: any) => a.idagencia === parseInt(destinoId));
    if (!origenAg || !destinoAg) return null;

    const intermedios = puntos.map((p, i) => ({
      nombre: p.esAgencia ? (agenciasList.find((a: any) => a.idagencia === parseInt(p.idagencia || ''))?.nombre || '') : p.nombre,
      idagencia: p.esAgencia ? (parseInt(p.idagencia || '') || null) : null,
      orden: i + 1,
      tiempodesdeanteriorth: parseInt(String(p.tiempodesdeanteriorth)) || 0,
      tiempodesdeanteriorm: parseInt(String(p.tiempodesdeanteriorm)) || 0,
    }));

    return [
      { nombre: origenAg.nombre, idagencia: origenAg.idagencia, orden: 0, tiempodesdeanteriorth: 0, tiempodesdeanteriorm: 0 },
      ...intermedios,
      { nombre: destinoAg.nombre, idagencia: destinoAg.idagencia, orden: intermedios.length + 1, tiempodesdeanteriorth: 0, tiempodesdeanteriorm: 0 },
    ];
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !origenId || !destinoId) { setFormMsg({ type: 'err', text: 'Nombre, origen y destino son requeridos.' }); return; }

    const pts = buildPuntosPayload();
    if (!pts) { setFormMsg({ type: 'err', text: 'Debes seleccionar agencias válidas' }); return; }

    const payload = {
      nombre, tiporuta, origen: origenId, destino: destinoId,
      duracionh, duracionm, distanciakm: distancia, via, puntos: pts,
    };

    const cb = {
      onSuccess: () => { setFormMsg({ type: 'ok', text: editingId ? 'Ruta actualizada.' : 'Ruta guardada.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
      onError: (error: any) => { setFormMsg({ type: 'err', text: error?.response?.data?.message || 'Error al guardar.' }); setTimeout(() => setFormMsg(null), 3000); },
    };
    editingId ? update.mutate({ id: editingId, data: payload }, cb) : create.mutate(payload, cb);
  };

  const togglePuntosExpandidos = async (idruta: string) => {
    if (expandido === idruta) {
      setExpandido(null);
      return;
    }
    setExpandido(idruta);
    try {
      const res = await rutasApi.obtenerPuntos(idruta);
      setPuntosExpandidos(res.data?.puntos || res.data?.data?.puntos || []);
    } catch {
      setPuntosExpandidos([]);
    }
  };

  /* ── utils ───────────────────────────────────────────────── */
  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <EstadoPrecioToggle />
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>add_road</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{editingId ? 'Editar Ruta' : 'Añadir Nueva Ruta'}</span>
        </div>

        <form onSubmit={handleGuardar}>
          {/* Info general */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <Field label="Nombre de la Ruta" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Pasto - Cali" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} required />
            </Field>

            <Field label="Agencia Origen" required>
              <select value={origenId} onChange={e => {
                const val = e.target.value;
                const ag = agenciasList.find((a: any) => a.idagencia === parseInt(val));
                setOrigenId(val);
                if (!nombre && ag && destinoId) {
                  const destAg = agenciasList.find((a: any) => a.idagencia === parseInt(destinoId));
                  if (destAg) setNombre(`${ag.nombre} - ${destAg.nombre}`);
                }
              }} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder} required>
                <option value="">Seleccionar Agencia...</option>
                {agenciasList.map((a: any) => <option key={a.idagencia} value={a.idagencia}>{a.nombre}</option>)}
              </select>
            </Field>

            <Field label="Agencia Destino" required>
              <select value={destinoId} onChange={e => {
                const val = e.target.value;
                const ag = agenciasList.find((a: any) => a.idagencia === parseInt(val));
                setDestinoId(val);
                if (!nombre && ag && origenId) {
                  const oriAg = agenciasList.find((a: any) => a.idagencia === parseInt(origenId));
                  if (oriAg) setNombre(`${oriAg.nombre} - ${ag.nombre}`);
                }
              }} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder} required>
                <option value="">Seleccionar Agencia...</option>
                {agenciasList.map((a: any) => <option key={a.idagencia} value={a.idagencia}>{a.nombre}</option>)}
              </select>
            </Field>

            <Field label="Duración Aproximada">
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="number" min="0" value={duracionh} onChange={e => setDuracionh(e.target.value)} placeholder="0" style={{ ...inputStyle, paddingRight: '20px' }} onFocus={focusBorder} onBlur={blurBorder} />
                  <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#94a3b8', fontWeight: 600, pointerEvents: 'none' }}>h</span>
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="number" min="0" max="59" value={duracionm} onChange={e => setDuracionm(e.target.value)} placeholder="0" style={{ ...inputStyle, paddingRight: '28px' }} onFocus={focusBorder} onBlur={blurBorder} />
                  <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#94a3b8', fontWeight: 600, pointerEvents: 'none' }}>min</span>
                </div>
              </div>
            </Field>

            <Field label="Distancia en km">
              <div style={{ position: 'relative' }}>
                <input type="number" step="0.01" min="0" value={distancia} onChange={e => setDistancia(e.target.value)} placeholder="Ej: 120" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#94a3b8', fontWeight: 600, pointerEvents: 'none' }}>km</span>
              </div>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '24px' }}>
            <Field label="Vía / Observaciones" optional>
              <input value={via} onChange={e => setVia(e.target.value)} placeholder="Ej: Vía Panamericana" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          {/* Puntos intermedios */}
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Puntos Intermedios
            </h4>
            <PuntosIntermedios
              puntos={puntos}
              agencias={agenciasList}
              origenId={origenId}
              destinoId={destinoId}
              origenNombre={agName(origenId)}
              destinoNombre={agName(destinoId)}
              onAgregar={() => setPuntos(prev => [...prev, puntoVacio()])}
              onEliminar={(id) => setPuntos(prev => prev.filter(p => p._id !== id))}
              onMover={(id, dir) => setPuntos(prev => {
                const arr = [...prev];
                const idx = arr.findIndex(p => p._id === id);
                const ni = idx + dir;
                if (ni < 0 || ni >= arr.length) return prev;
                [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
                return arr;
              })}
              onUpdate={(id, field, value) => setPuntos(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p))}
              onToggleAgencia={(id) => setPuntos(prev => prev.map(p => p._id === id ? { ...p, esAgencia: !p.esAgencia, idagencia: null, nombre: '' } : p))}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span> Cancelar
              </button>
            )}
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingId ? 'edit' : 'save'}</span>
              {editingId ? 'Actualizar Ruta' : 'Guardar Ruta'}
            </button>
          </div>
          {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: BLUE }}>list</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Listado de Rutas</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando rutas...</span>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {[
                      { label: 'ID', w: '60px' },
                      { label: 'Nombre', w: '140px' },
                      { label: 'Origen', w: '120px' },
                      { label: 'Destino', w: '120px' },
                      { label: 'Tipo Bus', w: '100px' },
                      { label: 'Duración', w: '80px' },
                      { label: 'Distancia', w: '80px' },
                      { label: 'Precio Actual', w: '100px' },
                      { label: 'Estado', w: '70px' },
                      { label: 'Acciones', w: '140px' },
                    ].map(({ label, w }) => (
                      <th key={label} style={{ width: w, padding: '11px 16px', textAlign: ['Duración', 'Distancia', 'Estado', 'Precio Actual', 'Acciones', 'ID'].includes(label) ? 'center' : 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2' }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedGroups.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron rutas.</td></tr>
                  ) : paginatedGroups.map((rutasGrupo, groupIdx) => {
                    return rutasGrupo.map((r, idx) => {
                      const isFirst = idx === 0;
                      const size = rutasGrupo.length;
                      return (
                        <React.Fragment key={`${r.id}-${r.idTipoBus || 'sin-tarifa'}-${idx}`}>
                          <tr style={{ borderBottom: idx === size - 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', borderRight: '1px solid #e8edf2', textAlign: 'center' }}>#{r.id}</td>}
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #e8edf2' }}>{r.nombre}</td>}
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderRight: '1px solid #e8edf2' }}>{agName(r.origen)}</td>}
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderRight: '1px solid #e8edf2' }}>{agName(r.destino)}</td>}
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{(r as any).tipoBus || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Sin tarifa</span>}</td>
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center', borderRight: '1px solid #e8edf2' }}>{r.duracionh}h {r.duracionm}m</td>}
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center', borderRight: '1px solid #e8edf2' }}>{r.distanciakm ?? r.precioBase} km</td>}
                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: esTraficoAlto ? '#dc2626' : '#16a34a', textAlign: 'center' }}>
                              {(r as any).precioActual ? `$${Number((r as any).precioActual).toLocaleString()}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                            </td>
                            {isFirst && <td rowSpan={size} style={{ padding: '12px 16px', textAlign: 'center', borderRight: '1px solid #e8edf2' }}><EstadoBadge activa={r.activa} /></td>}
                            {isFirst && (
                              <td rowSpan={size} style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                  <button title="Gestionar tarifas" onClick={() => window.location.href = `/rutas/${r.id}/tarifas`} style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span> Tarifas
                                  </button>
                                  <button title="Ver puntos" onClick={() => togglePuntosExpandidos(r.id)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>route</span> Puntos
                                  </button>
                                  <button title="Editar" onClick={() => startEdit(r)} style={{ padding: '4px', borderRadius: '4px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                  </button>
                                  <button title={r.activa ? "Desactivar" : "Activar"} onClick={() => toggleEstado.mutate({ id: r.id, activa: r.activa })} style={{ padding: '4px', borderRadius: '4px', background: r.activa ? '#fef2f2' : '#f0fdf4', color: r.activa ? '#ef4444' : '#22c55e', border: `1px solid ${r.activa ? '#fecaca' : '#bbf7d0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{r.activa ? 'block' : 'check_circle'}</span>
                                  </button>
                                  <button title="Eliminar" onClick={() => { if (window.confirm('¿Eliminar ruta?')) remove.mutate(r.id); }} style={{ padding: '4px', borderRadius: '4px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                          {isFirst && expandido === r.id && (
                            <FilaPuntosExpandidos puntos={puntosExpandidos} colSpan={10} />
                          )}
                        </React.Fragment>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando <strong style={{ color: '#475569' }}>{allGroupedRoutes.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}</strong> a <strong style={{ color: '#475569' }}>{Math.min(page * ITEMS_PER_PAGE, allGroupedRoutes.length)}</strong> de <strong style={{ color: '#475569' }}>{allGroupedRoutes.length}</strong> rutas
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                {visiblePages.map((p, i) => p === '...' ? <span key={`d${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>...</span> : <PagBtn key={p} label={String(p)} active={p === page} onClick={() => setPage(p as number)} />)}
                <NavArrow icon="chevron_right" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
