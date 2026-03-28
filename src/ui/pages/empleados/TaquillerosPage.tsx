import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useTaquilleros } from '../../hooks/useTaquilleros';
import { useOficinas } from '../../hooks/useOficinas';
import type { Taquillero } from '../../../domain/entities/Taquillero';

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

export const TaquillerosPage = () => {
  const { taquilleros, isLoading, create, update, activar } = useTaquilleros();
  const { oficinas } = useOficinas();
  const oficinasList = Array.isArray(oficinas) ? oficinas : [];
  const taquillerosList = useMemo(() => Array.isArray(taquilleros) ? taquilleros : [], [taquilleros]);

  /* ── form state ── */
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [tipodocumento, setTipodocumento] = useState('CC');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idoficina, setIdoficina] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── table state ── */
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  const list = useMemo(() => {
    if (filterEstado === 'TODOS') return taquillerosList;
    return taquillerosList.filter(t => filterEstado === 'ACTIVO' ? t.estado : !t.estado);
  }, [taquillerosList, filterEstado]);

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

  const oficinaCodigo = (id: number) => {
    const of = oficinasList.find(o => String(o.id) === String(id));
    return of?.codigo ?? of?.nombre ?? '—';
  };

  const resetForm = () => {
    setNombre(''); setApellido(''); setCorreo(''); setPassword('');
    setTipodocumento('CC'); setDocumento(''); setTelefono('');
    setIdoficina(''); setEditingId(null);
  };

  const startEdit = (t: Taquillero) => {
    setEditingId(t.idusuario);
    setNombre(t.nombre);
    setApellido(t.apellido);
    setCorreo(t.correo);
    setPassword('');
    setTipodocumento(t.tipodocumento || 'CC');
    setDocumento(t.documento);
    setTelefono(t.telefono);
    setIdoficina(String(t.idoficina));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── validaciones según la guía del backend ── */
  const validate = (): string | null => {
    const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/;
    if (!nombre.trim() || !nameRegex.test(nombre)) return 'Nombre: solo letras y espacios.';
    if (!apellido.trim() || !nameRegex.test(apellido)) return 'Apellido: solo letras y espacios.';
    if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Correo electrónico inválido.';
    if (!editingId) {
      if (!password || password.length < 6 || password.length > 12) return 'Contraseña: 6 a 12 caracteres.';
      if (!/[A-Z]/.test(password)) return 'Contraseña: debe tener al menos una mayúscula.';
      if (!/[0-9]/.test(password)) return 'Contraseña: debe tener al menos un número.';
      if (!/^[a-zA-Z0-9]+$/.test(password)) return 'Contraseña: solo caracteres alfanuméricos.';
    }
    if (!documento.trim() || !/^\d{1,10}$/.test(documento)) return 'Documento: solo números, máx 10 dígitos.';
    if (telefono && !/^\d{1,10}$/.test(telefono)) return 'Teléfono: solo números, máx 10 dígitos.';
    if (!idoficina) return 'Debe seleccionar una oficina.';
    return null;
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormMsg({ type: 'err', text: err }); setTimeout(() => setFormMsg(null), 4000); return; }

    if (editingId) {
      update.mutate(
        { idusuario: editingId, data: { nombre, apellido, correo, tipodocumento, documento, telefono, idoficina: Number(idoficina) } },
        {
          onSuccess: () => { setFormMsg({ type: 'ok', text: 'Taquillero actualizado.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
          onError: (e: any) => { setFormMsg({ type: 'err', text: e?.response?.data?.message || 'Error al actualizar.' }); setTimeout(() => setFormMsg(null), 4000); },
        },
      );
    } else {
      create.mutate(
        { nombre, apellido, correo, password, tipodocumento, documento, telefono, idoficina: Number(idoficina) },
        {
          onSuccess: () => { setFormMsg({ type: 'ok', text: 'Taquillero registrado correctamente.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
          onError: (e: any) => { setFormMsg({ type: 'err', text: e?.response?.data?.message || 'Error al registrar.' }); setTimeout(() => setFormMsg(null), 4000); },
        },
      );
    }
  };

  const handleActivar = (idusuario: number) => {
    activar.mutate(idusuario);
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  return (
    <Layout>
      {/* ── Formulario ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>point_of_sale</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{editingId ? 'Editar Taquillero' : 'Registrar Nuevo Taquillero'}</span>
        </div>
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <Field label="Nombre" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Apellido" required>
              <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Ej. Pérez" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Tipo Documento">
              <select value={tipodocumento} onChange={e => setTipodocumento(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="CC">CC - Cédula de Ciudadanía</option>
                <option value="CE">CE - Cédula de Extranjería</option>
                <option value="TI">TI - Tarjeta de Identidad</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Documento" required>
              <input value={documento} onChange={e => setDocumento(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Ej. 12345678" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Correo Electrónico" required>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>mail</span>
                <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </Field>
            <Field label="Teléfono">
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>call</span>
                <input value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="3001234567" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            {!editingId && (
              <Field label="Contraseña" required>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6-12 chars, 1 mayúscula, 1 número" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} maxLength={12} />
              </Field>
            )}
            <Field label="Oficina Asignada" required>
              <select value={idoficina} onChange={e => setIdoficina(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar Oficina...</option>
                {oficinasList.map(of => (
                  <option key={of.id} value={of.id}>{of.codigo || of.nombre}</option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span> Cancelar
              </button>
            )}
            <button type="submit" disabled={create.isPending || update.isPending} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: (create.isPending || update.isPending) ? 0.7 : 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingId ? 'edit' : 'save'}</span>
              {(create.isPending || update.isPending) ? 'Guardando...' : editingId ? 'Actualizar Taquillero' : 'Guardar Taquillero'}
            </button>
          </div>
          {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
        </form>
      </div>

      {/* ── Tabla ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Taquilleros Registrados</span>
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
            <span style={{ fontSize: '13px' }}>Cargando taquilleros...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[{ l: 'Nombre', w: '180px' }, { l: 'Documento', w: '120px' }, { l: 'Teléfono', w: '110px' }, { l: 'Correo', w: '180px' }, { l: 'Oficina', w: '120px' }, { l: 'Estado', w: '90px' }, { l: 'Acciones', w: '100px' }].map(({ l, w }) => (
                    <th key={l} style={{ width: w, padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron taquilleros.</td></tr>
                ) : paginated.map(t => (
                  <tr key={t.idusuario} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{t.nombre} {t.apellido}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.documento}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.telefono || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.correo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.oficina_codigo || oficinaCodigo(t.idoficina)}</td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge activo={t.estado} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button title="Editar" onClick={() => startEdit(t)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                        {!t.estado && (
                          <button title="Activar" onClick={() => handleActivar(t.idusuario)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onMouseEnter={e => (e.currentTarget.style.color = '#16a34a')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span></button>
                        )}
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
                <strong style={{ color: '#475569' }}>{list.length}</strong> taquilleros
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
