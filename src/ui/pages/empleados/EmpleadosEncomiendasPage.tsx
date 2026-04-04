import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useEmpleadosEncomiendas } from '../../hooks/useEmpleadosEncomiendas';
import { useOficinasEncomiendas } from '../../hooks/useOficinasEncomiendas';
import type { EmpleadoEncomienda } from '../../../domain/entities/EmpleadoEncomienda';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

function EstadoBadge({ activo }: { activo: boolean }) {
  const bg = activo ? '#dcfce7' : '#fee2e2';
  const color = activo ? '#15803d' : '#dc2626';
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: bg, color, fontSize: '11.5px', fontWeight: 700 }}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

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

export const EmpleadosEncomiendasPage = () => {
  const { empleados, isLoading, create, update } = useEmpleadosEncomiendas();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipodocumento, setTipodocumento] = useState('CC');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agenciaId, setAgenciaId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [page, setPage] = useState(1);

  const { oficinas } = useOficinasEncomiendas();
  const oficinasList = Array.isArray(oficinas) ? oficinas : [];

  const list = useMemo(() => Array.isArray(empleados) ? empleados : [], [empleados]);
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

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  const resetForm = () => { 
    setNombre(''); setApellido(''); setTipodocumento('CC'); setDocumento(''); 
    setTelefono(''); setEmail(''); setPassword(''); setAgenciaId(''); setEditingId(null); 
  };

  const startEdit = (emp: EmpleadoEncomienda) => {
    setEditingId(emp.id); 
    setNombre(emp.nombre || ''); 
    setApellido(emp.apellido || '');
    setTipodocumento(emp.tipodocumento || 'CC');
    setDocumento(emp.documento || '');
    setTelefono(emp.telefono || ''); 
    setEmail(emp.email || emp.correo || ''); 
    setPassword(''); // No cargamos contraseña al editar por seguridad
    setAgenciaId(emp.idoficinaencomienda ? String(emp.idoficinaencomienda) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !documento || !agenciaId || (!editingId && !password)) { 
      setFormMsg({ type: 'err', text: 'Nombre, apellido, documento, oficina y contraseña (para nuevos) son requeridos.' }); 
      return; 
    }

    if (password && (password.length < 6 || password.length > 12)) {
      setFormMsg({ type: 'err', text: 'La contraseña debe tener entre 6 y 12 caracteres.' });
      return;
    }
    
    const payload: any = { 
      nombre, 
      apellido,
      tipodocumento,
      documento, 
      telefono, 
      correo: email, 
      idoficinaencomienda: parseInt(agenciaId, 10), 
      activo: true 
    };

    if (password) payload.password = password;
    
    const cb = {
      onSuccess: () => { 
        setFormMsg({ type: 'ok', text: editingId ? 'Empleado actualizado.' : 'Empleado registrado.' }); 
        resetForm(); 
        setTimeout(() => setFormMsg(null), 3000); 
      },
      onError: () => { 
        setFormMsg({ type: 'err', text: 'Error al guardar.' }); 
        setTimeout(() => setFormMsg(null), 3000); 
      },
    };

    if (editingId) {
      update.mutate({ idusuario: parseInt(editingId, 10), data: payload }, cb);
    } else {
      create.mutate(payload, cb);
    }
  };

  return (
    <Layout>
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>package_2</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{editingId ? 'Editar Empleado' : 'Registrar Empleado de Encomiendas'}</span>
        </div>
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
            <Field label="Nombre" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Apellido" required>
              <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Ej. Pérez" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Correo Electrónico" required>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Contraseña" required={!editingId}>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6-12 caracteres" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Tipo Doc." required>
              <select value={tipodocumento} onChange={e => setTipodocumento(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PAS">PAS</option>
              </select>
            </Field>
            <Field label="Documento" required>
              <input value={documento} onChange={e => setDocumento(e.target.value)} placeholder="1234567890" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Teléfono" required>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="3001234567" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Oficina de Encomiendas" required>
              <select value={agenciaId} onChange={e => setAgenciaId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                {oficinasList.map((off: any) => (
                  <option key={off.id} value={off.id}>{off.nombre || off.direccion} - {off.ciudadNombre}</option>
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
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingId ? 'edit' : 'save'}</span> {editingId ? 'Actualizar' : 'Guardar Empleado'}
            </button>
          </div>
          {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Empleados de Encomiendas</span>
        </div>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando empleados...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nombre', 'Documento', 'Teléfono', 'Email', 'Agencia', 'Estado', 'Acciones'].map(l => (
                    <th key={l} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron empleados.</td></tr>
                ) : paginated.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{t.nombre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.documento}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.telefono}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                      {oficinasList.find((off: any) => off.id === t.idoficinaencomienda)?.nombre || '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge activo={t.activo} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => startEdit(t)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
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
                <strong style={{ color: '#475569' }}>{list.length}</strong> empleados
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
