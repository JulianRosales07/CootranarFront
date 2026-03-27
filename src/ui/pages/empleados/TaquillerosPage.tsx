import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

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
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [agencia, setAgencia] = useState('');

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  const taquillerosMock = useMemo(() => [
    { id: '1', nombre: 'María García', documento: '1085321456', telefono: '300 123 4567', email: 'maria@cootranar.com', agencia: 'Terminal Pasto', estado: 'Activo' },
    { id: '2', nombre: 'Carlos López', documento: '1085654321', telefono: '310 987 6543', email: 'carlos@cootranar.com', agencia: 'Terminal Ipiales', estado: 'Activo' },
    { id: '3', nombre: 'Ana Martínez', documento: '1085789012', telefono: '320 456 7890', email: 'ana@cootranar.com', agencia: 'Terminal Tumaco', estado: 'Inactivo' },
  ], []);

  return (
    <Layout>
      {/* ── Formulario ─────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>point_of_sale</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Registrar Nuevo Taquillero</span>
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <Field label="Nombre Completo" required>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. María García" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Documento" required>
              <input value={documento} onChange={e => setDocumento(e.target.value)} placeholder="Ej. 1085321456" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Agencia Asignada" required>
              <select value={agencia} onChange={e => setAgencia(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar Agencia...</option>
                <option>Terminal Pasto</option><option>Terminal Ipiales</option><option>Terminal Tumaco</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Teléfono">
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>call</span>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="300 123 4567" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </Field>
            <Field label="Correo Electrónico">
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#cbd5e1' }}>mail</span>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@cootranar.com" style={{ ...inputStyle, paddingLeft: '34px' }} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </Field>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')} onMouseLeave={e => (e.currentTarget.style.background = BLUE)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span> Guardar Taquillero
            </button>
          </div>
        </form>
      </div>

      {/* ── Tabla ───────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Taquilleros Registrados</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Nombre', 'Documento', 'Teléfono', 'Email', 'Agencia', 'Estado', 'Acciones'].map(l => (
                <th key={l} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2' }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taquillerosMock.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{t.nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.documento}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.telefono}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.email}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{t.agencia}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: t.estado === 'Activo' ? '#dcfce7' : '#fee2e2', color: t.estado === 'Activo' ? '#15803d' : '#dc2626', fontSize: '11.5px', fontWeight: 700 }}>{t.estado}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                    <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '13px 20px', borderTop: '1px solid #f1f5f9', fontSize: '12.5px', color: '#94a3b8' }}>
          Mostrando <strong style={{ color: '#475569' }}>1</strong> a <strong style={{ color: '#475569' }}>3</strong> de <strong style={{ color: '#475569' }}>3</strong> taquilleros
        </div>
      </div>
    </Layout>
  );
};
