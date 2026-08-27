import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useTarifasEncomiendas } from '../../hooks/useTarifasEncomiendas';
import { useOficinasEncomiendas } from '../../hooks/useOficinasEncomiendas';
import type { TarifaEncomienda } from '../../../domain/entities/TarifaEncomienda';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 8;

const formatPeso = (val: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val || 0);

function EstadoBadge({ activo }: { activo: boolean }) {
  const bg = activo ? '#dcfce7' : '#fee2e2';
  const color = activo ? '#15803d' : '#dc2626';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: '20px',
        background: bg,
        color,
        fontSize: '11.5px',
        fontWeight: 700,
      }}
    >
      {activo ? 'Activa' : 'Inactiva'}
    </span>
  );
}

function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        minWidth: '30px',
        height: '30px',
        padding: '0 6px',
        border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
        borderRadius: '6px',
        background: active ? BLUE : 'white',
        color: active ? 'white' : '#475569',
        fontSize: '13px',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '30px',
        height: '30px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#cbd5e1' : '#475569',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {icon}
      </span>
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}
      >
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '7px',
  fontSize: '13px',
  color: '#334155',
  outline: 'none',
  background: 'white',
  fontFamily: 'inherit',
};

export const TarifasEncomiendasPage = () => {
  const {
    tarifas,
    isLoading: loadingTarifas,
    createTarifa,
    updateTarifa,
    isCreating,
    isUpdating,
  } = useTarifasEncomiendas();

  const { oficinas, isLoading: loadingOficinas } = useOficinasEncomiendas();
  const oficinasList = Array.isArray(oficinas) ? oficinas.filter((o: any) => o.activo !== false) : [];

  // Form State
  const [idOficinaOrigen, setIdOficinaOrigen] = useState<string>('');
  const [idOficinaDestino, setIdOficinaDestino] = useState<string>('');
  const [valorBase, setValorBase] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Filters & Table State
  const [filtroOrigen, setFiltroOrigen] = useState<string>('');
  const [filtroDestino, setFiltroDestino] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [verSoloFaltantes, setVerSoloFaltantes] = useState<boolean>(false);
  const [page, setPage] = useState(1);

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = '#e2e8f0');

  const resetForm = () => {
    setIdOficinaOrigen('');
    setIdOficinaDestino('');
    setValorBase('');
    setEditingId(null);
  };

  const startEdit = (t: TarifaEncomienda) => {
    setEditingId(t.idTarifa);
    setIdOficinaOrigen(String(t.idOficinaOrigen));
    setIdOficinaDestino(String(t.idOficinaDestino));
    setValorBase(String(t.valorBase));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper mapa de nombres de oficina
  const oficinaMap = useMemo(() => {
    const map = new Map<number, string>();
    oficinasList.forEach((o: any) => {
      const nombreCompleto = `${o.nombre || 'Oficina'} (${o.ciudadNombre || o.ciudadId || ''})`;
      map.set(Number(o.id), nombreCompleto);
    });
    return map;
  }, [oficinasList]);

  // Lista de pares posibles y pares faltantes
  const paresFaltantes = useMemo(() => {
    const faltantes: { origen: any; destino: any }[] = [];
    if (oficinasList.length < 2) return faltantes;

    const setConfigurados = new Set(
      tarifas
        .filter((t) => t.activo)
        .map((t) => `${t.idOficinaOrigen}-${t.idOficinaDestino}`)
    );

    for (const origen of oficinasList) {
      for (const destino of oficinasList) {
        if (origen.id !== destino.id) {
          const key = `${origen.id}-${destino.id}`;
          if (!setConfigurados.has(key)) {
            faltantes.push({ origen, destino });
          }
        }
      }
    }
    return faltantes;
  }, [oficinasList, tarifas]);

  // Lista filtrada
  const list = useMemo(() => {
    return tarifas.filter((t) => {
      if (filtroOrigen && String(t.idOficinaOrigen) !== filtroOrigen) return false;
      if (filtroDestino && String(t.idOficinaDestino) !== filtroDestino) return false;
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const nomOrig = (t.nombreOficinaOrigen || oficinaMap.get(t.idOficinaOrigen) || '').toLowerCase();
        const nomDest = (t.nombreOficinaDestino || oficinaMap.get(t.idOficinaDestino) || '').toLowerCase();
        const precio = String(t.valorBase);
        return nomOrig.includes(query) || nomDest.includes(query) || precio.includes(query);
      }
      return true;
    });
  }, [tarifas, filtroOrigen, filtroDestino, busqueda, oficinaMap]);

  // Paginación
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

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOficinaOrigen) {
      setFormMsg({ type: 'err', text: 'Selecciona la oficina de origen.' });
      return;
    }
    if (!idOficinaDestino) {
      setFormMsg({ type: 'err', text: 'Selecciona la oficina de destino.' });
      return;
    }
    if (idOficinaOrigen === idOficinaDestino) {
      setFormMsg({ type: 'err', text: 'La oficina de origen y destino deben ser diferentes.' });
      return;
    }
    const numValorBase = parseFloat(valorBase);
    if (isNaN(numValorBase) || numValorBase <= 0) {
      setFormMsg({ type: 'err', text: 'El valor base debe ser un número positivo.' });
      return;
    }

    try {
      if (editingId) {
        await updateTarifa({
          id: editingId,
          datos: {
            valorBase: numValorBase,
            idOficinaOrigen: Number(idOficinaOrigen),
            idOficinaDestino: Number(idOficinaDestino),
          },
        });
        setFormMsg({ type: 'ok', text: 'Tarifa actualizada y versionada exitosamente.' });
      } else {
        await createTarifa({
          idOficinaOrigen: Number(idOficinaOrigen),
          idOficinaDestino: Number(idOficinaDestino),
          valorBase: numValorBase,
        });
        setFormMsg({ type: 'ok', text: 'Tarifa de encomienda registrada exitosamente.' });
      }
      resetForm();
      setTimeout(() => setFormMsg(null), 3500);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Error al guardar la tarifa.';
      setFormMsg({ type: 'err', text: errorMsg });
      setTimeout(() => setFormMsg(null), 4000);
    }
  };

  const handleConfigurarFaltante = (origenId: string, destinoId: string) => {
    setIdOficinaOrigen(origenId);
    setIdOficinaDestino(destinoId);
    setValorBase('15000');
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPosiblesPares = Math.max(0, oficinasList.length * (oficinasList.length - 1));
  const totalConfiguradas = tarifas.filter((t) => t.activo).length;
  const porcentajeCobertura =
    totalPosiblesPares > 0 ? Math.round((totalConfiguradas / totalPosiblesPares) * 100) : 0;

  return (
    <Layout>
      {/* ── Métricas y Resumen Superior ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8edf2', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>price_change</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarifas Activas</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalConfiguradas}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8edf2', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>store</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oficinas de Encomiendas</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{oficinasList.length}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8edf2', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: porcentajeCobertura === 100 ? '#f0fdf4' : '#fffbeb', color: porcentajeCobertura === 100 ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {porcentajeCobertura === 100 ? 'verified' : 'incomplete_circle'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cobertura de Rutas</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {porcentajeCobertura}%
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginLeft: '6px' }}>
                ({totalConfiguradas}/{totalPosiblesPares})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Formulario de Registro / Edición de Tarifa ── */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: BLUE }}>
              {editingId ? 'edit_note' : 'add_circle'}
            </span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
              {editingId ? 'Editar Tarifa de Encomienda' : 'Establecer Nueva Tarifa de Encomienda'}
            </span>
          </div>
          {paresFaltantes.length > 0 && (
            <button
              type="button"
              onClick={() => setVerSoloFaltantes(!verSoloFaltantes)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: verSoloFaltantes ? '#fef3c7' : '#f8fafc',
                color: verSoloFaltantes ? '#92400e' : '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#d97706' }}>
                warning
              </span>
              <span>{paresFaltantes.length} ruta(s) sin precio</span>
            </button>
          )}
        </div>

        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Oficina Origen */}
            <Field label="Oficina Origen" required>
              <select
                value={idOficinaOrigen}
                onChange={(e) => setIdOficinaOrigen(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder}
                onBlur={blurBorder}
                disabled={editingId !== null}
              >
                <option value="">Seleccionar Oficina Origen...</option>
                {oficinasList.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre || 'Oficina'} — {o.ciudadNombre || o.direccion}
                  </option>
                ))}
              </select>
            </Field>

            {/* Oficina Destino */}
            <Field label="Oficina Destino" required>
              <select
                value={idOficinaDestino}
                onChange={(e) => setIdOficinaDestino(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder}
                onBlur={blurBorder}
                disabled={editingId !== null}
              >
                <option value="">Seleccionar Oficina Destino...</option>
                {oficinasList
                  .filter((o: any) => String(o.id) !== idOficinaOrigen)
                  .map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre || 'Oficina'} — {o.ciudadNombre || o.direccion}
                    </option>
                  ))}
              </select>
            </Field>

            {/* Tarifa Base */}
            <Field label="Tarifa Base ($ COP)" required>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#64748b',
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={valorBase}
                  onChange={(e) => setValorBase(e.target.value)}
                  placeholder="Ej. 15000"
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
            </Field>
          </div>

          {/* Atajos de Precios Comunes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>Valores comunes:</span>
            {[10000, 12000, 15000, 18000, 20000, 25000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValorBase(String(v))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: valorBase === String(v) ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${valorBase === String(v) ? BLUE : '#e2e8f0'}`,
                  color: valorBase === String(v) ? BLUE : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {formatPeso(v)}
              </button>
            ))}
          </div>

          {/* Botones de acción */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'white',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '7px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                  close
                </span>
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: BLUE,
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isCreating || isUpdating ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: isCreating || isUpdating ? 0.7 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {editingId ? 'edit' : 'save'}
              </span>
              {editingId ? 'Actualizar Tarifa' : 'Guardar Tarifa'}
            </button>
          </div>

          {formMsg && (
            <p
              style={{
                marginTop: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626',
                textAlign: 'right',
              }}
            >
              {formMsg.text}
            </p>
          )}
        </form>
      </div>

      {/* ── Asistente de Rutas Sin Tarifa ── */}
      {verSoloFaltantes && (
        <div style={{ background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', padding: '18px 22px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '20px' }}>
                route
              </span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#92400e' }}>
                Rutas entre oficinas pendientes de configurar ({paresFaltantes.length})
              </span>
            </div>
            <button
              onClick={() => setVerSoloFaltantes(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', display: 'flex' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
          <p style={{ fontSize: '12.5px', color: '#78350f', marginBottom: '14px' }}>
            Las encomiendas no se pueden crear ni cotizar en estas rutas hasta que se establezca su tarifa base:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {paresFaltantes.map(({ origen, destino }) => (
              <div
                key={`${origen.id}-${destino.id}`}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #fde68a',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                  <span>{origen.ciudadNombre || origen.nombre}</span>
                  <span style={{ color: '#94a3b8', margin: '0 6px' }}>➔</span>
                  <span>{destino.ciudadNombre || destino.nombre}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleConfigurarFaltante(String(origen.id), String(destino.id))}
                  style={{
                    background: '#eff6ff',
                    color: BLUE,
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Establecer $
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabla de Tarifas Configuradas ── */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Cabecera y Filtros */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            Tarifario de Encomiendas ({list.length})
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filtro Origen */}
            <select
              value={filtroOrigen}
              onChange={(e) => {
                setFiltroOrigen(e.target.value);
                setPage(1);
              }}
              style={{ ...inputStyle, width: 'auto', minWidth: '160px', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="">Todos los Orígenes</option>
              {oficinasList.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.nombre} ({o.ciudadNombre})
                </option>
              ))}
            </select>

            {/* Filtro Destino */}
            <select
              value={filtroDestino}
              onChange={(e) => {
                setFiltroDestino(e.target.value);
                setPage(1);
              }}
              style={{ ...inputStyle, width: 'auto', minWidth: '160px', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="">Todos los Destinos</option>
              {oficinasList.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.nombre} ({o.ciudadNombre})
                </option>
              ))}
            </select>

            {/* Búsqueda */}
            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px',
                  color: '#94a3b8',
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Buscar ruta o precio..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPage(1);
                }}
                style={{ ...inputStyle, width: '180px', padding: '6px 10px 6px 30px', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        {loadingTarifas || loadingOficinas ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando tarifas de encomiendas...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Oficina Origen', 'Oficina Destino', 'Tarifa Base', 'Estado', 'Última Actualización', 'Acciones'].map((l) => (
                    <th
                      key={l}
                      style={{
                        padding: '11px 16px',
                        textAlign: 'left',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderBottom: '1px solid #e8edf2',
                      }}
                    >
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No se encontraron tarifas configuradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginated.map((t) => {
                    const origenTexto = t.nombreOficinaOrigen || oficinaMap.get(t.idOficinaOrigen) || `Oficina #${t.idOficinaOrigen}`;
                    const destinoTexto = t.nombreOficinaDestino || oficinaMap.get(t.idOficinaDestino) || `Oficina #${t.idOficinaDestino}`;

                    return (
                      <tr
                        key={t.idTarifa}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: BLUE }}>
                              trip_origin
                            </span>
                            <span>{origenTexto}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>
                              location_on
                            </span>
                            <span>{destinoTexto}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                          {formatPeso(t.valorBase)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <EstadoBadge activo={t.activo} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                          {t.fechaActualizacion
                            ? new Date(t.fechaActualizacion).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => startEdit(t)}
                            title="Editar Tarifa Base"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              color: BLUE,
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              edit
                            </span>
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Paginación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando{' '}
                <strong style={{ color: '#475569' }}>
                  {list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}
                </strong>{' '}
                a{' '}
                <strong style={{ color: '#475569' }}>
                  {Math.min(page * ITEMS_PER_PAGE, list.length)}
                </strong>{' '}
                de <strong style={{ color: '#475569' }}>{list.length}</strong> tarifas
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
                {visiblePages.map((p, i) =>
                  p === '...' ? (
                    <span key={`d${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>
                      ...
                    </span>
                  ) : (
                    <PagBtn key={p} label={String(p)} active={p === page} onClick={() => setPage(p as number)} />
                  )
                )}
                <NavArrow
                  icon="chevron_right"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TarifasEncomiendasPage;
