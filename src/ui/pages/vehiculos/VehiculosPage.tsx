import React, { useState, useMemo, useCallback } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useVehiculos } from '../../hooks/useVehiculos';
import { useTiposBus } from '../../hooks/useTiposBus';
import type { Vehiculo, EstadoVehiculo } from '../../../domain/entities/Vehiculo';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

/* ─── Seat map types ──────────────────────────────────────── */
type SeatCell = { type: 'seat'; number: number } | { type: 'empty' } | { type: 'driver' } | { type: 'bathroom' };
type SeatRow = [SeatCell, SeatCell, SeatCell, SeatCell]; // left-pair | aisle | right-pair

/* ─── Status badge ────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    DISPONIBLE:      { bg: '#dcfce7', color: '#15803d' },
    EN_RUTA:         { bg: '#dbeafe', color: '#1d4ed8' },
    MANTENIMIENTO:   { bg: '#fef9c3', color: '#a16207' },
    FUERA_SERVICIO:  { bg: '#fee2e2', color: '#dc2626' },
  };
  const { bg, color } = map[estado] ?? { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: '20px',
      background: bg, color, fontSize: '11.5px', fontWeight: 700,
    }}>
      {estado.replace('_', ' ')}
    </span>
  );
}

/* ─── Pagination helpers ──────────────────────────────────── */
function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      minWidth: '30px', height: '30px', padding: '0 6px',
      border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
      borderRadius: '6px', background: active ? BLUE : 'white',
      color: active ? 'white' : '#475569',
      fontSize: '13px', fontWeight: active ? 700 : 400,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    }}>{label}</button>
  );
}
function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '30px', height: '30px',
      border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? '#cbd5e1' : '#475569', transition: 'all 0.15s',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </button>
  );
}

/* ─── Field helper ────────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: '6px',
      }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px',
  fontSize: '13px', color: '#334155', outline: 'none',
  background: 'white', fontFamily: 'inherit',
};

/* ═══════════════════════════════════════════════════════════ */
export const VehiculosPage = () => {
  const { vehiculos, isLoading, create, update, remove } = useVehiculos();
  const { tiposBus } = useTiposBus();
  const tiposBusList = Array.isArray(tiposBus) ? tiposBus : [];

  /* ── form state ──────────────────────────────────────────── */
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState('');
  const [tipoBusId, setTipoBusId] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [estado, setEstado] = useState<EstadoVehiculo>('DISPONIBLE');
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── seat config state ───────────────────────────────────── */
  const [seatRows, setSeatRows] = useState<SeatRow[]>([]);
  const [seatMode, setSeatMode] = useState<'add' | 'editNum' | 'bathroom' | null>(null);
  const [editingSeatIdx, setEditingSeatIdx] = useState<{ row: number; col: number } | null>(null);
  const [editingSeatVal, setEditingSeatVal] = useState('');
  const [segundoPiso, setSegundoPiso] = useState(false);

  const nextSeatNumber = useCallback(() => {
    let max = 0;
    for (const row of seatRows) for (const c of row) if (c.type === 'seat' && c.number > max) max = c.number;
    return max + 1;
  }, [seatRows]);

  const handleSeatClick = (ri: number, ci: number) => {
    // No permitir modificar la fila del conductor (puerta del bus)
    const isDriverRowCheck = seatRows[ri]?.some(c => c.type === 'driver');
    if (isDriverRowCheck) return;

    if (seatMode === 'add') {
      setSeatRows(prev => {
        const copy = prev.map(r => [...r] as SeatRow);
        const cell = copy[ri][ci];
        if (cell.type === 'empty') {
          copy[ri][ci] = { type: 'seat', number: nextSeatNumber() };
        }
        return copy;
      });
    } else if (seatMode === 'bathroom') {
      setSeatRows(prev => {
        const copy = prev.map(r => [...r] as SeatRow);
        const cell = copy[ri][ci];
        if (cell.type === 'empty' || cell.type === 'seat') {
          copy[ri][ci] = { type: 'bathroom' };
        } else if (cell.type === 'bathroom') {
          copy[ri][ci] = { type: 'empty' };
        }
        return copy;
      });
    } else if (seatMode === 'editNum') {
      const cell = seatRows[ri]?.[ci];
      if (cell?.type === 'seat') {
        setEditingSeatIdx({ row: ri, col: ci });
        setEditingSeatVal(String(cell.number));
      }
    }
  };

  const confirmSeatEdit = () => {
    if (!editingSeatIdx) return;
    const num = parseInt(editingSeatVal, 10);
    if (isNaN(num) || num < 1) return;
    setSeatRows(prev => {
      const copy = prev.map(r => [...r] as SeatRow);
      copy[editingSeatIdx.row][editingSeatIdx.col] = { type: 'seat', number: num };
      return copy;
    });
    setEditingSeatIdx(null);
    setEditingSeatVal('');
  };

  const clearSeats = () => {
    setSeatRows([]);
  };

  const addSeatRow = () => {
    setSeatRows(prev => [...prev, [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }]]);
  };

  const initDefaultSeatMap = (overrideCap?: number) => {
    const cap = overrideCap !== undefined ? overrideCap : (Number(capacidad) || 37);
    const rows: SeatRow[] = [];
    // Fila del conductor: volante a la izquierda, puerta a la derecha (vacío)
    rows.push([{ type: 'driver' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }]);
    let num = 1;
    const dataRows = Math.ceil(cap / 4);
    for (let i = 0; i < dataRows; i++) {
      const row: SeatCell[] = [];
      for (let j = 0; j < 4; j++) {
        row.push(num <= cap ? { type: 'seat', number: num++ } : { type: 'empty' });
      }
      rows.push(row as SeatRow);
    }
    setSeatRows(rows);
  };

  const seatMapJson = useMemo(() => {
    return JSON.stringify(seatRows.map(r => r.map(c => {
      if (c.type === 'seat') return c.number;
      if (c.type === 'driver') return 'D';
      if (c.type === 'bathroom') return 'WC';
      return null;
    })), null, 2);
  }, [seatRows]);

  /* ── table state ─────────────────────────────────────────── */
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  /* ── derived list ────────────────────────────────────────── */
  const list = useMemo(() => {
    const arr = Array.isArray(vehiculos) ? vehiculos : [];
    if (filterEstado === 'TODOS') return arr;
    return arr.filter((v) => v.estado === filterEstado);
  }, [vehiculos, filterEstado]);

  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const paginated = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const visiblePages = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  })();

  /* ── helpers ─────────────────────────────────────────────── */
  const tipoBusName = (id: string) => tiposBusList.find((t) => t.id === id)?.nombre ?? '—';

  const resetForm = () => {
    setPlaca(''); setMarca(''); setModelo(''); setAño('');
    setTipoBusId(''); setCapacidad(''); setEstado('DISPONIBLE');
    setActivo(true); setEditingId(null);
  };

  const startEdit = (v: Vehiculo) => {
    setEditingId(v.id); setPlaca(v.placa); setMarca(v.marca);
    setModelo(v.modelo); setAño(String(v.año)); setTipoBusId(v.tipoBusId);
    setCapacidad(String(v.capacidad)); setEstado(v.estado); setActivo(v.activo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !marca.trim() || !modelo.trim()) {
      setFormMsg({ type: 'err', text: 'Placa, marca y modelo son requeridos.' });
      return;
    }
    const payload = {
      placa, marca, modelo,
      año: Number(año) || new Date().getFullYear(),
      tipoBusId, capacidad: Number(capacidad) || 0,
      estado, activo,
    };

    if (editingId) {
      update.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { setFormMsg({ type: 'ok', text: 'Vehículo actualizado.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
        onError: () => { setFormMsg({ type: 'err', text: 'Error al actualizar.' }); setTimeout(() => setFormMsg(null), 3000); },
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { setFormMsg({ type: 'ok', text: 'Vehículo guardado.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
        onError: () => { setFormMsg({ type: 'err', text: 'Error al guardar.' }); setTimeout(() => setFormMsg(null), 3000); },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este vehículo?')) remove.mutate(id);
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Row: Formulario + Asientos ─────────────────────── */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', marginBottom: '24px' }}>

      {/* ── Formulario Añadir / Editar Vehículo ────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2', padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>
            directions_bus
          </span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            {editingId ? 'Editar Vehículo' : 'Información del Vehículo'}
          </span>
        </div>

        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Fila 1: Número Móvil + Placa */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Número Móvil">
              <input value={marca} onChange={e => setMarca(e.target.value)}
                placeholder="Ej. 1045" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Placa" required>
              <input value={placa} onChange={e => setPlaca(e.target.value)}
                placeholder="EJ: ABC-123" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          {/* Fila 2: Tipo de Servicio + Tipo de Bus */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Tipo de Servicio">
              <select value={estado} onChange={e => setEstado(e.target.value as EstadoVehiculo)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="FUERA_SERVICIO">Fuera de Servicio</option>
              </select>
            </Field>
            <Field label="Tipo de Bus">
              <select value={tipoBusId} onChange={e => setTipoBusId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                {tiposBusList.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Fila 3: Modelo + Capacidad + Cantidad de Pisos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Modelo">
              <input value={modelo} onChange={e => setModelo(e.target.value)}
                placeholder="Ej. 2024" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Capacidad Pasajeros">
              <input type="number" value={capacidad} onChange={e => setCapacidad(e.target.value)}
                placeholder="Ej. 42" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Cantidad de Pisos">
              <input type="number" value={año} onChange={e => setAño(e.target.value)}
                placeholder="1" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          {/* Sección: Asignación de Conductores */}
          <div style={{ marginTop: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: BLUE }}>person</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Asignación de Conductores</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Conductor Principal" required>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', color: '#cbd5e1',
                  }}>search</span>
                  <input placeholder="Buscar por nombre o cc"
                    style={{ ...inputStyle, paddingLeft: '34px' }}
                    onFocus={focusBorder} onBlur={blurBorder} />
                </div>
              </Field>
              <Field label="Segundo Conductor (Opcional)">
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', color: '#cbd5e1',
                  }}>search</span>
                  <input placeholder="Buscar por nombre o cc"
                    style={{ ...inputStyle, paddingLeft: '34px' }}
                    onFocus={focusBorder} onBlur={blurBorder} />
                </div>
              </Field>
            </div>
          </div>

          {/* Botón Guardar - ancho completo */}
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'white', color: '#64748b',
                border: '1px solid #cbd5e1', borderRadius: '10px',
                padding: '14px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                Cancelar
              </button>
            )}
            <button type="submit" style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: BLUE, color: 'white',
              border: 'none', borderRadius: '10px',
              padding: '14px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {editingId ? 'edit' : 'save'}
              </span>
              {editingId ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
            </button>
          </div>

          {formMsg && (
            <p style={{
              marginTop: '10px', fontSize: '13px', fontWeight: 600,
              color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626',
              textAlign: 'center',
            }}>{formMsg.text}</p>
          )}
        </form>
      </div>

      {/* ── Configuración de Asientos (al lado del formulario) ── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2', padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        flex: 1, minWidth: 0, maxWidth: '380px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: BLUE }}>airline_seat_recline_normal</span>
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', lineHeight: '1.2' }}>
              Configuración de<br />Asientos
            </span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: segundoPiso ? BLUE : '#cbd5e1', position: 'relative',
              transition: 'background 0.2s', cursor: 'pointer',
            }} onClick={() => setSegundoPiso(!segundoPiso)}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '2px', left: segundoPiso ? '18px' : '2px',
                transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', lineHeight: '1.2' }}>
              Segundo<br />Piso
            </span>
          </label>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button onClick={() => { if (seatRows.length === 0) initDefaultSeatMap(37); setSeatMode(seatMode === 'add' ? null : 'add'); }}
            style={{
              flex: 1, padding: '9px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: `1px solid ${seatMode === 'add' ? BLUE : '#e2e8f0'}`,
              background: seatMode === 'add' ? '#eff6ff' : 'white',
              color: seatMode === 'add' ? BLUE : '#475569',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
            + Añadir
          </button>
          <button onClick={() => setSeatMode(seatMode === 'editNum' ? null : 'editNum')}
            style={{
              flex: 1, padding: '9px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: `1px solid ${seatMode === 'editNum' ? BLUE : '#e2e8f0'}`,
              background: seatMode === 'editNum' ? '#eff6ff' : 'white',
              color: seatMode === 'editNum' ? BLUE : '#475569',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span> Editar N°
          </button>
          <button onClick={() => setSeatMode(seatMode === 'bathroom' ? null : 'bathroom')}
            style={{
              flex: 1, padding: '9px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: `1px solid ${seatMode === 'bathroom' ? '#7c3aed' : '#e2e8f0'}`,
              background: seatMode === 'bathroom' ? '#f5f3ff' : 'white',
              color: seatMode === 'bathroom' ? '#7c3aed' : '#475569',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>wc</span> Baño
          </button>
          <button onClick={clearSeats}
            style={{
              flex: 1, padding: '9px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #fecaca', background: 'white', color: '#dc2626',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
            ✕ Vaciar
          </button>
        </div>

        {/* Seat grid */}
        <div style={{
          border: '1px solid #e8edf2', borderRadius: '12px', padding: '20px 24px',
          background: '#fafbfc',
        }}>
          {seatRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#cbd5e1', display: 'block', marginBottom: '10px' }}>
                event_seat
              </span>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 14px' }}>Sin mapa de asientos</p>
              <button onClick={() => initDefaultSeatMap(37)} style={{
                padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                border: `1px solid ${BLUE}`, background: 'white', color: BLUE,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Generar mapa automático</button>
            </div>
          ) : (
            <>
              {seatRows.map((row, ri) => {
                const isDriverRow = row.some(c => c.type === 'driver');
                return (
                  <div key={ri}>
                    {isDriverRow && (
                      <div style={{
                        textAlign: 'right', fontSize: '10px', fontWeight: 700,
                        color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '4px',
                      }}>FRENTE</div>
                    )}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '38px 38px 20px 38px 38px',
                      gap: '6px', marginBottom: '6px', justifyContent: 'center',
                    }}>
                      {row.slice(0, 2).map((cell, ci) => (
                        <SeatButton key={ci} cell={cell} onClick={() => handleSeatClick(ri, ci)}
                          isEditing={editingSeatIdx?.row === ri && editingSeatIdx?.col === ci} ri={ri} isDriverRow={isDriverRow} />
                      ))}
                      <div />
                      {row.slice(2, 4).map((cell, ci) => (
                        <SeatButton key={ci + 2} cell={cell} onClick={() => handleSeatClick(ri, ci + 2)}
                          isEditing={editingSeatIdx?.row === ri && editingSeatIdx?.col === ci + 2} ri={ri} isDriverRow={isDriverRow} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {seatMode === 'add' && (
                <button onClick={addSeatRow} style={{
                  width: '100%', padding: '8px', marginTop: '8px', borderRadius: '8px',
                  border: '1px dashed #cbd5e1', background: 'transparent', color: '#94a3b8',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                }}>+ Fila</button>
              )}
            </>
          )}
        </div>

        {/* Edit seat number inline */}
        {editingSeatIdx && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '14px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Nuevo N°:</span>
            <input value={editingSeatVal} onChange={e => setEditingSeatVal(e.target.value)}
              type="number" min={1}
              style={{ ...inputStyle, width: '80px', padding: '6px 10px' }}
              onKeyDown={e => { if (e.key === 'Enter') confirmSeatEdit(); }} />
            <button onClick={confirmSeatEdit} style={{
              padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
              background: BLUE, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>OK</button>
            <button onClick={() => { setEditingSeatIdx(null); setEditingSeatVal(''); }} style={{
              padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
              background: 'white', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancelar</button>
          </div>
        )}

        {/* Export JSON */}
        {seatRows.length > 0 && (
          <button onClick={() => { navigator.clipboard.writeText(seatMapJson); alert('Mapa copiado al portapapeles'); }}
            style={{
              width: '100%', marginTop: '18px', padding: '12px', borderRadius: '8px',
              border: '1px solid #e2e8f0', background: 'white', color: '#475569',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
            {'⟨ ⟩'} Guardar Mapa (JSON)
          </button>
        )}
      </div>

      </div>{/* end flex row */}

      {/* ── Tabla de Vehículos ────────────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
        }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            Vehículos Registrados
          </span>
          <div style={{ position: 'relative' }}>
            <select value={filterEstado}
              onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
              style={{
                padding: '7px 32px 7px 12px',
                border: '1px solid #e2e8f0', borderRadius: '7px',
                background: 'white', color: '#475569',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                appearance: 'none', outline: 'none',
              }}>
              <option value="TODOS">Todos los Estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="FUERA_SERVICIO">Fuera de Servicio</option>
            </select>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', color: '#94a3b8', pointerEvents: 'none',
            }}>expand_more</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando vehículos...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'Placa',       width: '110px' },
                    { label: 'Marca',       width: '140px' },
                    { label: 'Modelo',      width: '150px' },
                    { label: 'Año',         width: '70px'  },
                    { label: 'Tipo Bus',    width: '140px' },
                    { label: 'Capacidad',   width: '90px'  },
                    { label: 'Estado',      width: '120px' },
                    { label: 'Acciones',    width: '80px'  },
                  ].map(({ label, width }) => (
                    <th key={label} style={{
                      width, padding: '11px 16px',
                      textAlign: 'left', fontSize: '10.5px', fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '1px solid #e8edf2', background: '#f8fafc',
                    }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No se encontraron vehículos.
                    </td>
                  </tr>
                ) : paginated.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{v.placa}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{v.marca}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{v.modelo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{v.año}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{tipoBusName(v.tipoBusId)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{v.capacidad}</td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge estado={v.estado} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button title="Editar" onClick={() => startEdit(v)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                        </button>
                        <button title="Eliminar" onClick={() => handleDelete(v.id)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 20px', borderTop: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando{' '}
                <strong style={{ color: '#475569' }}>{list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}</strong>{' '}
                a{' '}
                <strong style={{ color: '#475569' }}>{Math.min(page * ITEMS_PER_PAGE, list.length)}</strong>{' '}
                de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong>{' '}
                vehículos
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                {visiblePages.map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>...</span>
                  ) : (
                    <PagBtn key={p} label={String(p)} active={p === page} onClick={() => setPage(p as number)} />
                  )
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

/* ─── Seat cell button ────────────────────────────────────── */
function SeatButton({ cell, onClick, isEditing, isDriverRow }: { cell: SeatCell; onClick: () => void; isEditing: boolean; ri: number; isDriverRow?: boolean }) {
  const size = '38px';
  if (cell.type === 'empty') {
    if (isDriverRow) {
      return <div style={{ width: size, height: size }} />;
    }
    return (
      <button onClick={onClick} style={{
        width: size, height: size, borderRadius: '8px',
        border: '1px dashed #e2e8f0', background: 'transparent',
        cursor: 'pointer', fontSize: '10px', color: '#cbd5e1',
      }} />
    );
  }
  if (cell.type === 'driver') {
    return (
      <div style={{
        width: size, height: size, borderRadius: '8px',
        background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'white' }}>directions</span>
      </div>
    );
  }
  if (cell.type === 'bathroom') {
    return (
      <button onClick={onClick} style={{
        width: size, height: size, borderRadius: '8px',
        border: '1px solid #c4b5fd', background: '#ede9fe',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#7c3aed' }}>wc</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '8px',
      border: isEditing ? `2px solid ${BLUE}` : '1px solid #e2e8f0',
      background: isEditing ? '#eff6ff' : '#f1f5f9',
      cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#475569',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit', transition: 'all 0.1s',
    }}>
      {cell.number}
    </button>
  );
}
