import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useTiposBus } from '../../hooks/useTiposBus';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

export const TiposBusPage = () => {
  const { tiposBus, isLoading, create, update, deactivate } = useTiposBus();

  /* ── form state ─────────────────────────────────────── */
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── filters ────────────────────────────────────────── */
  const [page, setPage] = useState(1);

  /* ── derived list ───────────────────────────────────── */
  const list = useMemo(() => {
    return Array.isArray(tiposBus) ? tiposBus : [];
  }, [tiposBus]);

  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const paginated = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* ── handlers ───────────────────────────────────────── */
  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setEditingId(null);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setFormMsg({ type: 'err', text: 'El nombre es requerido.' });
      return;
    }

    if (editingId) {
      update.mutate(
        { id: editingId, data: { nombre, descripcion } },
        {
          onSuccess: () => {
            setFormMsg({ type: 'ok', text: 'Tipo de bus actualizado correctamente.' });
            resetForm();
            setTimeout(() => setFormMsg(null), 3000);
          },
          onError: () => {
            setFormMsg({ type: 'err', text: 'Error al actualizar el tipo de bus.' });
            setTimeout(() => setFormMsg(null), 3000);
          },
        }
      );
    } else {
      create.mutate(
        { nombre, descripcion },
        {
          onSuccess: () => {
            setFormMsg({ type: 'ok', text: 'Tipo de bus guardado correctamente.' });
            resetForm();
            setTimeout(() => setFormMsg(null), 3000);
          },
          onError: () => {
            setFormMsg({ type: 'err', text: 'Error al guardar el tipo de bus.' });
            setTimeout(() => setFormMsg(null), 3000);
          },
        }
      );
    }
  };

  /* ── pagination pages array ─────────────────────────── */
  const visiblePages = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  })();

  return (
    <Layout>
      {/* ── Add form card ─────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        border: '1px solid #e8edf2',
        padding: '20px 24px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '18px' }}>
          {editingId ? 'Editar Tipo de Bus' : 'Añadir Nuevo Tipo de Bus'}
        </div>

        <form onSubmit={handleGuardar}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr auto',
            gap: '16px',
            alignItems: 'end',
          }}>
            {/* Nombre */}
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155',
                marginBottom: '7px',
              }}>
                Nombre
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', color: '#cbd5e1',
                }}>
                  directions_bus
                </span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Microbus, Aerovan"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px 9px 32px',
                    border: '1px solid #e2e8f0', borderRadius: '7px',
                    fontSize: '13px', color: '#334155',
                    outline: 'none', background: 'white', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#93b4e0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155',
                marginBottom: '7px',
              }}>
                Descripción
              </label>
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles adicionales del tipo de bus..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '7px',
                  fontSize: '13px', color: '#334155',
                  outline: 'none', background: 'white', fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#93b4e0')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: BLUE, color: 'white',
                  border: 'none', borderRadius: '7px',
                  padding: '8px 20px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit', lineHeight: 1.35,
                  transition: 'background 0.15s',
                  minHeight: '46px',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0a2f72')}
                onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>
                  {editingId ? 'edit' : 'save'}
                </span>
                <span style={{ display: 'block' }}>
                  {editingId ? 'Actualizar' : 'Guardar'}<br />Tipo
                </span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: 'white', color: '#64748b',
                    border: '1px solid #cbd5e1', borderRadius: '7px',
                    padding: '8px 12px',
                    fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '46px', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {formMsg && (
            <p style={{
              marginTop: '10px', fontSize: '13px', fontWeight: 600,
              color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626',
            }}>
              {formMsg.text}
            </p>
          )}
        </form>
      </div>

      {/* ── Table card ────────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        border: '1px solid #e8edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            Listado de Tipos de Bus
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Filtrar */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              border: '1px solid #e2e8f0', borderRadius: '7px',
              background: 'white', color: '#475569',
              fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#1e293b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_list</span>
              Filtrar
            </button>

            {/* Exportar */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              border: '1px solid #e2e8f0', borderRadius: '7px',
              background: 'white', color: '#475569',
              fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#1e293b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Exportar
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando tipos de bus...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'ID', width: '90px' },
                    { label: 'Nombre', width: '150px' },
                    { label: 'Descripción', width: undefined },
                    { label: 'Estado', width: '110px' },
                    { label: 'Acciones', width: '100px' },
                  ].map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        width,
                        padding: '11px 20px',
                        textAlign: 'left',
                        fontSize: '10.5px', fontWeight: 700, color: '#64748b',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: '1px solid #e8edf2',
                        background: '#f8fafc',
                      }}
                    >
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
                      No se encontraron tipos de bus.
                    </td>
                  </tr>
                ) : (
                  paginated.map((tipo, idx) => {
                    const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                    const rowId = `#TB${String(globalIdx).padStart(3, '0')}`;

                    return (
                      <tr
                        key={tipo.id}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                      >
                        {/* ID */}
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                          {rowId}
                        </td>

                        {/* Nombre */}
                        <td style={{ padding: '13px 20px', fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                          {tipo.nombre}
                        </td>

                        {/* Descripción */}
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                          {tipo.descripcion || '—'}
                        </td>

                        {/* Estado */}
                        <td style={{ padding: '13px 20px' }}>
                          {tipo.activo ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 12px',
                              borderRadius: '20px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              fontSize: '12px', fontWeight: 600,
                            }}>
                              Activo
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 12px',
                              borderRadius: '20px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '12px', fontWeight: 600,
                            }}>
                              Inactivo
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                              title="Editar"
                              onClick={() => {
                                setEditingId(tipo.id);
                                setNombre(tipo.nombre);
                                setDescripcion(tipo.descripcion || '');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#60a5fa',
                                display: 'flex', alignItems: 'center',
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#60a5fa')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            </button>
                            <button
                              title="Eliminar"
                              onClick={() => {
                                if (window.confirm('¿Seguro que deseas desactivar este tipo de bus?')) {
                                  deactivate.mutate(tipo.id);
                                }
                              }}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#f87171',
                                display: 'flex', alignItems: 'center',
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#f87171')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 20px',
              borderTop: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando{' '}
                <strong style={{ color: '#475569' }}>
                  {list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}
                </strong>{' '}
                a{' '}
                <strong style={{ color: '#475569' }}>
                  {Math.min(page * ITEMS_PER_PAGE, list.length)}
                </strong>{' '}
                de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong>{' '}
                resultados
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {/* Previous arrow */}
                <NavArrow
                  icon="chevron_left"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                />

                {/* Page numbers */}
                {visiblePages.map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>
                      ...
                    </span>
                  ) : (
                    <PagBtn
                      key={p}
                      label={String(p)}
                      active={p === page}
                      onClick={() => setPage(p as number)}
                    />
                  )
                )}

                {/* Next arrow */}
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

/* ─── Pagination helpers ─────────────────────────────────── */
function PagBtn({ label, onClick, active = false }: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        minWidth: '30px', height: '30px',
        padding: '0 6px',
        border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
        borderRadius: '6px',
        background: active ? BLUE : 'white',
        color: active ? 'white' : '#475569',
        fontSize: '13px',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function NavArrow({ icon, disabled, onClick }: {
  icon: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '30px', height: '30px',
        border: '1px solid #e2e8f0', borderRadius: '6px',
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#cbd5e1' : '#475569',
        transition: 'all 0.15s',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </button>
  );
}
