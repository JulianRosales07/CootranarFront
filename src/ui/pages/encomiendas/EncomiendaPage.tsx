import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useEncomiendas, buscarEncomiendaPorReferencia } from '../../hooks/useEncomiendas';
import { useOficinasEncomiendas } from '../../hooks/useOficinasEncomiendas';
import { QrScannerModal } from '../../components/encomiendas/QrScannerModal';
import type { EstadoEncomienda } from '../../hooks/useEncomiendas';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

const ESTADOS: { value: EstadoEncomienda; label: string; bg: string; color: string }[] = [
  { value: 'RECIBIDA', label: 'Recibida', bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'EN_TRANSITO', label: 'En Tránsito', bg: '#fef9c3', color: '#a16207' },
  { value: 'ENTREGADA', label: 'Entregada', bg: '#dcfce7', color: '#15803d' },
  { value: 'DEVUELTA', label: 'Devuelta', bg: '#fee2e2', color: '#dc2626' },
];

function EstadoBadge({ estado }: { estado: EstadoEncomienda }) {
  const cfg = ESTADOS.find(e => e.value === estado) || ESTADOS[0];
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontSize: '11.5px', fontWeight: 700 }}>
      {cfg.label}
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

export const EncomiendaPage = () => {
  const { encomiendas, isLoading, create, update, cambiarEstado } = useEncomiendas();
  const { oficinas } = useOficinasEncomiendas();
  const oficinasList = Array.isArray(oficinas) ? oficinas.filter((o: any) => o.activo) : [];

  const [remitenteNombre, setRemitenteNombre] = useState('');
  const [remitenteDocumento, setRemitenteDocumento] = useState('');
  const [remitenteTelefono, setRemitenteTelefono] = useState('');
  const [destinatarioNombre, setDestinatarioNombre] = useState('');
  const [destinatarioDocumento, setDestinatarioDocumento] = useState('');
  const [destinatarioTelefono, setDestinatarioTelefono] = useState('');
  const [peso, setPeso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valorDeclarado, setValorDeclarado] = useState('');
  const [oficinaOrigenId, setOficinaOrigenId] = useState('');
  const [oficinaDestinoId, setOficinaDestinoId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [page, setPage] = useState(1);

  const [referencia, setReferencia] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [busquedaMsg, setBusquedaMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [encomiendaEncontrada, setEncomiendaEncontrada] = useState<any | null>(null);
  const [scannerAbierto, setScannerAbierto] = useState(false);

  const list = useMemo(() => Array.isArray(encomiendas) ? encomiendas : [], [encomiendas]);
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

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  const resetForm = () => {
    setRemitenteNombre(''); setRemitenteDocumento(''); setRemitenteTelefono('');
    setDestinatarioNombre(''); setDestinatarioDocumento(''); setDestinatarioTelefono('');
    setPeso(''); setDescripcion(''); setValorDeclarado('');
    setOficinaOrigenId(''); setOficinaDestinoId(''); setEditingId(null);
  };

  const startEdit = (enc: any) => {
    setEditingId(enc.id);
    setRemitenteNombre(enc.remitenteNombre);
    setRemitenteDocumento(enc.remitenteDocumento);
    setRemitenteTelefono(enc.remitenteTelefono || '');
    setDestinatarioNombre(enc.destinatarioNombre);
    setDestinatarioDocumento(enc.destinatarioDocumento);
    setDestinatarioTelefono(enc.destinatarioTelefono || '');
    setPeso(String(enc.peso ?? ''));
    setDescripcion(enc.descripcion || '');
    setValorDeclarado(String(enc.valorDeclarado ?? ''));
    setOficinaOrigenId(enc.oficinaOrigenId);
    setOficinaDestinoId(enc.oficinaDestinoId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remitenteNombre || !remitenteDocumento) { setFormMsg({ type: 'err', text: 'Los datos del remitente son requeridos.' }); return; }
    if (!destinatarioNombre || !destinatarioDocumento) { setFormMsg({ type: 'err', text: 'Los datos del destinatario son requeridos.' }); return; }
    if (!oficinaOrigenId || !oficinaDestinoId) { setFormMsg({ type: 'err', text: 'La oficina de origen y destino son requeridas.' }); return; }
    if (oficinaOrigenId === oficinaDestinoId) { setFormMsg({ type: 'err', text: 'El origen y el destino no pueden ser la misma oficina.' }); return; }
    if (!peso || Number(peso) <= 0) { setFormMsg({ type: 'err', text: 'El peso debe ser mayor a 0.' }); return; }

    const payload = {
      remitenteNombre, remitenteDocumento, remitenteTelefono,
      destinatarioNombre, destinatarioDocumento, destinatarioTelefono,
      peso, descripcion, valorDeclarado,
      oficinaOrigenId, oficinaDestinoId,
    };

    const cb = {
      onSuccess: () => {
        setFormMsg({ type: 'ok', text: editingId ? 'Encomienda actualizada.' : 'Encomienda registrada.' });
        resetForm();
        setEncomiendaEncontrada(null);
        setReferencia('');
        setBusquedaMsg(null);
        setTimeout(() => setFormMsg(null), 3000);
      },
      onError: (err: any) => {
        const errorMsg = err?.message || err?.response?.data?.message || 'Error al guardar.';
        setFormMsg({ type: 'err', text: errorMsg });
        setTimeout(() => setFormMsg(null), 3000);
      },
    };
    editingId ? update.mutate({ id: editingId, data: payload }, cb) : create.mutate(payload, cb);
  };

  const buscarPorReferencia = async (valor: string) => {
    const ref = valor.trim();
    if (!ref) { setBusquedaMsg({ type: 'err', text: 'Ingresa o escanea una referencia.' }); return; }
    setBuscando(true);
    setBusquedaMsg(null);
    setEncomiendaEncontrada(null);
    try {
      const enc = await buscarEncomiendaPorReferencia(ref);
      if (!enc) {
        setBusquedaMsg({ type: 'err', text: 'No se encontró ninguna encomienda con esa referencia.' });
      } else {
        setEncomiendaEncontrada(enc);
        setBusquedaMsg({ type: 'ok', text: 'Encomienda encontrada.' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al buscar la referencia.';
      setBusquedaMsg({ type: 'err', text: msg });
    } finally {
      setBuscando(false);
    }
  };

  const handleQrResult = (valor: string) => {
    setScannerAbierto(false);
    setReferencia(valor);
    buscarPorReferencia(valor);
  };

  const cargarEncontradaEnFormulario = () => {
    if (!encomiendaEncontrada) return;
    startEdit(encomiendaEncontrada);
  };

  const handleCambiarEstado = (id: string, estado: EstadoEncomienda) => {
    cambiarEstado.mutate({ id, estado }, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Error al cambiar el estado.';
        alert(msg);
      }
    });
  };

  return (
    <Layout>
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>qr_code_scanner</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Buscar Encomienda por Referencia o QR</span>
        </div>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px' }}>
          Escanea el código QR generado por la plataforma e-commerce o digita la referencia de la encomienda para cargar su información.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); buscarPorReferencia(referencia); }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
        >
          <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
            <input
              value={referencia}
              onChange={e => setReferencia(e.target.value)}
              placeholder="Ej. ENC-2026-000123"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>
          <button type="submit" disabled={buscando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: buscando ? 'default' : 'pointer', fontFamily: 'inherit', opacity: buscando ? 0.7 : 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span> {buscando ? 'Buscando...' : 'Buscar'}
          </button>
          <button type="button" onClick={() => setScannerAbierto(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: BLUE, border: `1px solid ${BLUE}`, borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span> Escanear QR
          </button>
        </form>

        {busquedaMsg && (
          <p style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: busquedaMsg.type === 'ok' ? '#16a34a' : '#dc2626' }}>{busquedaMsg.text}</p>
        )}

        {encomiendaEncontrada && (
          <div style={{ marginTop: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{encomiendaEncontrada.remitenteNombre} → {encomiendaEncontrada.destinatarioNombre}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {encomiendaEncontrada.oficinaOrigenNombre || '-'} a {encomiendaEncontrada.oficinaDestinoNombre || '-'} · {encomiendaEncontrada.peso} kg
              </div>
              <div style={{ marginTop: '8px' }}>
                <EstadoBadge estado={encomiendaEncontrada.estado} />
              </div>
            </div>
            <button onClick={cargarEncontradaEnFormulario} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 16px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>edit</span> Editar esta encomienda
            </button>
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>inventory_2</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{editingId ? 'Editar Encomienda' : 'Registrar Encomienda'}</span>
        </div>
        <form onSubmit={handleGuardar}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Remitente</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <Field label="Nombre" required>
              <input value={remitenteNombre} onChange={e => setRemitenteNombre(e.target.value)} placeholder="Ej. Juan Pérez" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Documento" required>
              <input value={remitenteDocumento} onChange={e => setRemitenteDocumento(e.target.value)} placeholder="1234567890" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Teléfono">
              <input value={remitenteTelefono} onChange={e => setRemitenteTelefono(e.target.value)} placeholder="315 111 2222" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>Destinatario</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <Field label="Nombre" required>
              <input value={destinatarioNombre} onChange={e => setDestinatarioNombre(e.target.value)} placeholder="Ej. María Gómez" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Documento" required>
              <input value={destinatarioDocumento} onChange={e => setDestinatarioDocumento(e.target.value)} placeholder="0987654321" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Teléfono">
              <input value={destinatarioTelefono} onChange={e => setDestinatarioTelefono(e.target.value)} placeholder="315 111 2222" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>Envío</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Oficina de Origen" required>
              <select value={oficinaOrigenId} onChange={e => setOficinaOrigenId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar oficina...</option>
                {oficinasList.map((o: any) => <option key={o.id} value={o.id}>{o.nombre || o.direccion} - {o.ciudadNombre}</option>)}
              </select>
            </Field>
            <Field label="Oficina de Destino" required>
              <select value={oficinaDestinoId} onChange={e => setOficinaDestinoId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar oficina...</option>
                {oficinasList.map((o: any) => <option key={o.id} value={o.id}>{o.nombre || o.direccion} - {o.ciudadNombre}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Peso (kg)" required>
              <input type="number" min="0" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ej. 2.5" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Valor Declarado">
              <input type="number" min="0" step="0.01" value={valorDeclarado} onChange={e => setValorDeclarado(e.target.value)} placeholder="Ej. 50000" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Descripción">
              <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej. Caja de documentos" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
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
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingId ? 'edit' : 'save'}</span> {editingId ? 'Actualizar' : 'Guardar Encomienda'}
            </button>
          </div>
          {formMsg && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626', textAlign: 'right' }}>{formMsg.text}</p>}
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Encomiendas</span>
        </div>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
            <span style={{ fontSize: '13px' }}>Cargando encomiendas...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Remitente', 'Destinatario', 'Origen', 'Destino', 'Peso', 'Estado', 'Acciones'].map(l => (
                    <th key={l} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e8edf2' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron encomiendas.</td></tr>
                ) : paginated.map((enc: any) => (
                  <tr key={enc.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                      {enc.remitenteNombre}
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>{enc.remitenteDocumento}{enc.remitenteTelefono ? ` · ${enc.remitenteTelefono}` : ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                      {enc.destinatarioNombre}
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>{enc.destinatarioDocumento}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{enc.oficinaOrigenNombre || oficinasList.find((o: any) => o.id === enc.oficinaOrigenId)?.nombre || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{enc.oficinaDestinoNombre || oficinasList.find((o: any) => o.id === enc.oficinaDestinoId)?.nombre || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{enc.peso} kg</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <EstadoBadge estado={enc.estado} />
                        <select
                          value={enc.estado}
                          onChange={e => handleCambiarEstado(enc.id, e.target.value as EstadoEncomienda)}
                          style={{ fontSize: '11px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'inherit', background: 'white' }}
                        >
                          {ESTADOS.map(es => <option key={es.value} value={es.value}>{es.label}</option>)}
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => startEdit(enc)} title="Editar" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = BLUE)} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                        </button>
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
                <strong style={{ color: '#475569' }}>{list.length}</strong> encomiendas
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

      <QrScannerModal isOpen={scannerAbierto} onClose={() => setScannerAbierto(false)} onResult={handleQrResult} />
    </Layout>
  );
};
