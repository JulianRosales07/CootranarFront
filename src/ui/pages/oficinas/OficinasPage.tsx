import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useOficinas } from '../../hooks/useOficinas';
import { useAgencias } from '../../hooks/useAgencias';
import type { Oficina } from '../../../domain/entities/Oficina';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

/* ─── Status badge ────────────────────────────────────────── */
function EstadoBadge({ activo }: { activo: boolean }) {
  const bg = activo ? '#dcfce7' : '#fee2e2';
  const color = activo ? '#15803d' : '#dc2626';
  const label = activo ? 'Activo' : 'Inactivo';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: '20px',
      background: bg, color, fontSize: '11.5px', fontWeight: 700,
    }}>
      {label}
    </span>
  );
}

/* ─── Pagination helpers ──────────────────────────────────── */
function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      minWidth: '30px', height: '30px', padding: '0 6px',
      border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
      borderRadius: '6px',
      background: active ? BLUE : 'white',
      color: active ? 'white' : '#475569',
      fontSize: '13px', fontWeight: active ? 700 : 400,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    }}>
      {label}
    </button>
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

const inputWithIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '34px',
};

/* ═══════════════════════════════════════════════════════════ */
export const OficinasPage = () => {
  const { oficinas, isLoading, create, update, remove } = useOficinas();
  const { agencias } = useAgencias();

  /* ── form state ──────────────────────────────────────────── */
  const [nombre, setNombre] = useState('');
  const [agenciaId, setAgenciaId] = useState('');
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── table state ─────────────────────────────────────────── */
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  /* ── derived list ────────────────────────────────────────── */
  const list = useMemo(() => {
    const arr = Array.isArray(oficinas) ? oficinas : [];
    if (filterEstado === 'TODOS') return arr;
    return arr.filter((o) => (filterEstado === 'ACTIVO' ? o.activo : !o.activo));
  }, [oficinas, filterEstado]);

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
  const agenciasList = Array.isArray(agencias) ? agencias : [];

  const agenciaName = (id: string) => {
    const ag = agenciasList.find((a: any) => a.idagencia === parseInt(id));
    return ag?.nombre ?? '—';
  };

  const resetForm = () => {
    setNombre(''); setAgenciaId(''); setActivo(true); setEditingId(null);
  };

  const startEdit = (o: any) => {
    setEditingId(o.idoficina);
    setNombre(o.codigo); // El codigo en BD es el nombre
    setAgenciaId(o.idagencia ? String(o.idagencia) : '');
    setActivo(o.activo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !agenciaId) {
      setFormMsg({ type: 'err', text: 'Nombre y agencia son requeridos.' });
      return;
    }
    const payload = { nombre, agenciaId, activo };

    if (editingId) {
      update.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => { setFormMsg({ type: 'ok', text: 'Oficina actualizada.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
          onError: () => { setFormMsg({ type: 'err', text: 'Error al actualizar oficina.' }); setTimeout(() => setFormMsg(null), 3000); },
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { setFormMsg({ type: 'ok', text: 'Oficina guardada correctamente.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
        onError: () => { setFormMsg({ type: 'err', text: 'Error al guardar oficina.' }); setTimeout(() => setFormMsg(null), 3000); },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta oficina?')) {
      remove.mutate(id);
    }
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Formulario Añadir / Editar Oficina ─────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2', padding: '20px 24px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>
            apartment
          </span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            {editingId ? 'Editar Oficina' : 'Añadir Nueva Oficina'}
          </span>
        </div>

        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Nombre" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Taquilla Principal" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Agencia" required>
              <select value={agenciaId} onChange={e => setAgenciaId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar Agencia...</option>
                {agenciasList.map((ag: any) => (
                  <option key={ag.idagencia} value={ag.idagencia}>{ag.nombre}</option>
                ))}
              </select>
            </Field>
          </div>

          {editingId && (
            <div style={{ marginTop: '14px', maxWidth: '200px' }}>
              <Field label="Estado">
                <select value={activo ? 'true' : 'false'}
                  onChange={e => setActivo(e.target.value === 'true')}
                  style={{ ...inputStyle, appearance: 'none' }}
                  onFocus={focusBorder} onBlur={blurBorder}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </Field>
            </div>
          )}

          <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'white', color: '#64748b',
                border: '1px solid #cbd5e1', borderRadius: '7px',
                padding: '10px 16px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                Cancelar
              </button>
            )}
            <button type="submit" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: BLUE, color: 'white',
              border: 'none', borderRadius: '7px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {editingId ? 'edit' : 'save'}
              </span>
              {editingId ? 'Actualizar Oficina' : 'Guardar Oficina'}
            </button>
          </div>

          {formMsg && (
            <p style={{
              marginTop: '10px', fontSize: '13px', fontWeight: 600,
              color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626',
              textAlign: 'right',
            }}>
              {formMsg.text}
            </p>
          )}
        </form>
      </div>

      {/* ── Tabla de Oficinas ─────────────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
        }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            Oficinas Registradas
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={filterEstado}
              onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
              style={{
                padding: '7px 32px 7px 12px',
                border: '1px solid #e2e8f0', borderRadius: '7px',
                background: 'white', color: '#475569',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                appearance: 'none', outline: 'none',
              }}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', color: '#94a3b8', pointerEvents: 'none',
            }}>expand_more</span>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando oficinas...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'ID',        width: '80px' },
                    { label: 'Nombre',    width: '300px' },
                    { label: 'Agencia',   width: '300px' },
                    { label: 'Estado',    width: '120px'  },
                    { label: 'Acciones',  width: '120px'  },
                  ].map(({ label, width }) => (
                    <th key={label} style={{
                      width, padding: '11px 16px',
                      textAlign: 'left', fontSize: '10.5px', fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '1px solid #e8edf2', background: '#f8fafc',
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '48px', textAlign: 'center',
                      color: '#94a3b8', fontSize: '13px',
                    }}>
                      No se encontraron oficinas.
                    </td>
                  </tr>
                ) : (
                  paginated.map((oficina: any) => (
                    <tr
                      key={oficina.idoficina}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>
                        #{oficina.idoficina}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                        {oficina.codigo}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                        {oficina.nombreagencia || agenciaName(oficina.idagencia)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <EstadoBadge activo={oficina.activo} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button title="Editar" onClick={() => startEdit(oficina)}
                            style={{
                              background: 'none', border: 'none', padding: 0,
                              cursor: 'pointer', color: '#94a3b8',
                              display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button title="Eliminar" onClick={() => handleDelete(oficina.idoficina)}
                            style={{
                              background: 'none', border: 'none', padding: 0,
                              cursor: 'pointer', color: '#94a3b8',
                              display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer / Pagination */}
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
                oficinas
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
