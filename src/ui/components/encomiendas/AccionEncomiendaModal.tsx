import React, { useState } from 'react';

const BLUE = '#0D3B8E';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px',
  color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit',
};

const normalizarNombre = (valor: string) => valor
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toUpperCase();

const normalizarDocumento = (valor: string) => valor.trim().replace(/[.\s-]/g, '');

interface AccionEncomiendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'ENTREGAR' | 'DEVOLVER' | null;
  referencia?: string;
  nombreDestinatario?: string;
  documentoDestinatario?: string;
  cargando?: boolean;
  onConfirmar: (datos: { documentoRecibe?: string; nombreRecibe?: string; observaciones?: string }) => void;
}

/**
 * Modal que valida la identidad del receptor antes de entregar una encomienda
 * o solicita el motivo cuando se marca como devuelta.
 */
export const AccionEncomiendaModal: React.FC<AccionEncomiendaModalProps> = ({
  isOpen,
  onClose,
  tipo,
  referencia,
  nombreDestinatario = '',
  documentoDestinatario = '',
  cargando,
  onConfirmar,
}) => {
  const [documentoRecibe, setDocumentoRecibe] = useState('');
  const [nombreRecibe, setNombreRecibe] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !tipo) return null;

  const handleClose = () => {
    setDocumentoRecibe('');
    setNombreRecibe('');
    setObservaciones('');
    setError(null);
    onClose();
  };

  const handleConfirmar = () => {
    if (tipo === 'ENTREGAR') {
      const documentoNormalizado = normalizarDocumento(documentoRecibe);
      const nombreNormalizado = normalizarNombre(nombreRecibe);

      if (!/^\d{5,10}$/.test(documentoNormalizado)) {
        setError('El documento de quien recibe es obligatorio (solo números, entre 5 y 10 dígitos).');
        return;
      }
      if (!nombreNormalizado) {
        setError('El nombre de quien recibe es obligatorio.');
        return;
      }
      if (documentoNormalizado !== normalizarDocumento(documentoDestinatario)) {
        setError('La cédula ingresada no corresponde al destinatario registrado. Solo el destinatario puede recibir la encomienda.');
        return;
      }
      if (nombreNormalizado !== normalizarNombre(nombreDestinatario)) {
        setError('El nombre ingresado no corresponde al destinatario registrado. Solo el destinatario puede recibir la encomienda.');
        return;
      }

      setError(null);
      onConfirmar({
        documentoRecibe: documentoNormalizado,
        nombreRecibe: nombreRecibe.trim().replace(/\s+/g, ' '),
        observaciones: observaciones.trim() || undefined,
      });
    } else if (tipo === 'DEVOLVER') {
      if (!observaciones.trim()) {
        setError('Debes escribir una observación o motivo de la devolución.');
        return;
      }
      onConfirmar({ observaciones });
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {tipo === 'ENTREGAR' ? 'Registrar entrega de encomienda' : 'Marcar encomienda como devuelta'}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {referencia && (
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
              Referencia: <strong style={{ color: '#0f172a' }}>{referencia}</strong>
            </p>
          )}

          {tipo === 'ENTREGAR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1e3a8a', lineHeight: 1.5 }}>
                <strong>Destinatario autorizado:</strong><br />
                {nombreDestinatario || 'Sin nombre registrado'} — C.C. {documentoDestinatario || 'Sin documento registrado'}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>
                  Documento de quien recibe <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={documentoRecibe}
                  onChange={e => { setDocumentoRecibe(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(null); }}
                  placeholder="Ej. 1234567890"
                  maxLength={10}
                  inputMode="numeric"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>
                  Nombre de quien recibe <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={nombreRecibe}
                  onChange={e => { setNombreRecibe(e.target.value); setError(null); }}
                  placeholder="Ej. Juan Pérez"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>
                  Observaciones
                </label>
                <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
          )}

          {tipo === 'DEVOLVER' && (
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>
                Observación / motivo de la devolución <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3} placeholder="Ej. Destinatario no reside en la dirección indicada" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          )}

          {error && <p style={{ marginTop: '10px', fontSize: '12.5px', color: '#dc2626', fontWeight: 600 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
            <button onClick={handleClose} style={{ background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={cargando}
              style={{ background: tipo === 'DEVOLVER' ? '#dc2626' : BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: cargando ? 'default' : 'pointer', fontFamily: 'inherit', opacity: cargando ? 0.7 : 1 }}
            >
              {cargando ? 'Procesando...' : tipo === 'ENTREGAR' ? 'Confirmar Entrega' : 'Confirmar Devolución'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
