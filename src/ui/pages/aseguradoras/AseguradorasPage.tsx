import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useAseguradoras } from '../../hooks/useAseguradoras';

/* ─── helpers ─────────────────────────────────────────────── */
function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {};
const PALETTE = ['#4F86C6', '#6DBB9A', '#E98D5C', '#B97BD4', '#E96C6C', '#5BB8A8', '#D4A056', '#7B8FD4'];
function avatarColor(id: string): string {
  if (!AVATAR_COLORS[id]) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
    AVATAR_COLORS[id] = PALETTE[Math.abs(hash) % PALETTE.length];
  }
  return AVATAR_COLORS[id];
}

const ITEMS_PER_PAGE = 4;
const BLUE = '#0D3B8E';

/* ─── component ───────────────────────────────────────────── */
export const AseguradorasPage = () => {
  const { aseguradoras, isLoading } = useAseguradoras();

  /* form state */
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* filters */
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [page, setPage] = useState(1);

  /* derived list */
  const list = useMemo(() => {
    const arr = Array.isArray(aseguradoras) ? aseguradoras : [];
    return arr.filter((a) => {
      const matchEstado =
        filterEstado === 'todos' ||
        (filterEstado === 'activo' && a.activo) ||
        (filterEstado === 'inactivo' && !a.activo);
      return matchEstado;
    });
  }, [aseguradoras, filterEstado]);

  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const paginated = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* handlers */
  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim()) {
      setFormMsg({ type: 'err', text: 'Por favor completa todos los campos.' });
      return;
    }
    setFormMsg({ type: 'ok', text: 'Aseguradora guardada correctamente.' });
    setNombre('');
    setNit('');
    setTimeout(() => setFormMsg(null), 3000);
  };

  return (
    <Layout>
      {/* ── Add form card ──────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        border: '1px solid #e8edf2',
        padding: '20px 24px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Card title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>
            health_and_safety
          </span>
          <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a' }}>
            Añadir Nueva Aseguradora
          </span>
        </div>

        {/* Form row */}
        <form onSubmit={handleGuardar}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '16px',
            alignItems: 'end',
          }}>
            {/* Nombre */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '10.5px', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px',
              }}>
                Nombre de la Aseguradora
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', color: '#cbd5e1',
                }}>
                  business
                </span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Seguros Bolívar"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px 9px 34px',
                    border: '1px solid #e2e8f0', borderRadius: '7px',
                    fontSize: '13px', color: '#334155',
                    outline: 'none', background: 'white',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#93b4e0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            {/* NIT */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '10.5px', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px',
              }}>
                NIT
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', color: '#cbd5e1',
                }}>
                  tag
                </span>
                <input
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  placeholder="Ej. 890903407-9"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px 9px 34px',
                    border: '1px solid #e2e8f0', borderRadius: '7px',
                    fontSize: '13px', color: '#334155',
                    outline: 'none', background: 'white',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#93b4e0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            {/* Save button */}
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: BLUE, color: 'white',
                border: 'none', borderRadius: '7px',
                padding: '9px 18px',
                fontSize: '13.5px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
                height: '38px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>save</span>
              Guardar Aseguradora
            </button>
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

      {/* ── Table card ─────────────────────────────────────── */}
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
            Aseguradoras Registradas
          </span>

          {/* Estado dropdown — styled to match image */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={filterEstado}
              onChange={(e) => { setFilterEstado(e.target.value as typeof filterEstado); setPage(1); }}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '7px 32px 7px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '7px',
                fontSize: '13px', color: '#334155',
                background: 'white', cursor: 'pointer',
                outline: 'none', fontFamily: 'inherit', fontWeight: 500,
              }}
            >
              <option value="todos">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', color: '#94a3b8', pointerEvents: 'none',
            }}>
              expand_more
            </span>
          </div>
        </div>

        {/* Table content */}
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando aseguradoras...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    { label: 'ID', width: '80px' },
                    { label: 'Nombre Aseguradora', width: undefined },
                    { label: 'NIT', width: '160px' },
                    { label: 'Estado', width: '120px' },
                    { label: 'Acciones', width: '100px' },
                  ].map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        width,
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontSize: '10.5px', fontWeight: 700, color: '#94a3b8',
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        borderBottom: '1px solid #f1f5f9',
                        background: 'white',
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
                      No se encontraron aseguradoras.
                    </td>
                  </tr>
                ) : (
                  paginated.map((a, idx) => {
                    const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                    const rowId = `AS-${String(globalIdx).padStart(3, '0')}`;
                    const color = avatarColor(a.id);
                    const initials = getInitials(a.nombre);

                    return (
                      <tr
                        key={a.id}
                        style={{ borderBottom: '1px solid #f8fafc' }}
                      >
                        {/* ID */}
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                          {rowId}
                        </td>

                        {/* Nombre with circular avatar */}
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Circle avatar */}
                            <div style={{
                              width: '30px', height: '30px',
                              borderRadius: '50%',
                              background: color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'white', letterSpacing: '0.02em' }}>
                                {initials}
                              </span>
                            </div>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                              {a.nombre}
                            </span>
                          </div>
                        </td>

                        {/* NIT */}
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: '#475569' }}>
                          {a.nit}
                        </td>

                        {/* Estado */}
                        <td style={{ padding: '13px 20px' }}>
                          {a.activo ? (
                            /* ACTIVO: green pill */
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 12px',
                              borderRadius: '20px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              fontSize: '11.5px', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                              ACTIVO
                            </span>
                          ) : (
                            /* INACTIVO: plain text */
                            <span style={{
                              fontSize: '13px', fontWeight: 500, color: '#475569',
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                              INACTIVO
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              title="Editar"
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center',
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            </button>
                            <button
                              title="Eliminar"
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center',
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
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
                Mostrando {list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(page * ITEMS_PER_PAGE, list.length)} de {list.length} aseguradoras
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PagBtn
                  label="Anterior"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PagBtn
                    key={p}
                    label={String(p)}
                    active={p === page}
                    onClick={() => setPage(p)}
                  />
                ))}
                <PagBtn
                  label="Siguiente"
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

/* ─── Pagination button ─────────────────────────────────────── */
function PagBtn({
  label,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: '32px', height: '30px',
        padding: '0 8px',
        border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
        borderRadius: '6px',
        background: active ? BLUE : 'white',
        color: active ? 'white' : disabled ? '#cbd5e1' : '#475569',
        fontSize: '13px',
        fontWeight: active ? 700 : 400,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
