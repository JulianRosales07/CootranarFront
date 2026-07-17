import React, { useState } from 'react';
import { QrScannerModal } from './QrScannerModal';
import type { EncomiendaDTO } from '../../../application/dto/EncomiendaDTO';

const BLUE = '#0D3B8E';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px',
  color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit',
};

const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

interface BuscadorReferenciaProps {
  buscando: boolean;
  mensaje: { type: 'ok' | 'err'; text: string } | null;
  encomiendaEncontrada: EncomiendaDTO | null;
  onBuscar: (referencia: string) => void;
  onSeleccionar: (encomienda: EncomiendaDTO) => void;
}

/**
 * Input de referencia + botón de cámara para escanear el QR de la
 * plataforma e-commerce o digitar la referencia de una encomienda.
 */
export const BuscadorReferencia: React.FC<BuscadorReferenciaProps> = ({
  buscando,
  mensaje,
  encomiendaEncontrada,
  onBuscar,
  onSeleccionar,
}) => {
  const [referencia, setReferencia] = useState('');
  const [scannerAbierto, setScannerAbierto] = useState(false);

  const handleQrResult = (valor: string) => {
    setScannerAbierto(false);
    setReferencia(valor);
    onBuscar(valor);
  };

  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>qr_code_scanner</span>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Buscar Encomienda por Referencia o QR</span>
      </div>
      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px' }}>
        Escanea el código QR generado por la plataforma e-commerce o digita la referencia de la encomienda para cargar su información.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); onBuscar(referencia); }}
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
          <input
            value={referencia}
            onChange={e => setReferencia(e.target.value)}
            placeholder="Ej. A1B2C3D4E5"
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

      {mensaje && (
        <p style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: mensaje.type === 'ok' ? '#16a34a' : '#dc2626' }}>{mensaje.text}</p>
      )}

      {encomiendaEncontrada && (
        <div style={{ marginTop: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
              {encomiendaEncontrada.nombreRemitente || 'Remitente'} → {encomiendaEncontrada.nombreDestinatario}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {encomiendaEncontrada.oficinaOrigenNombre || '-'} a {encomiendaEncontrada.oficinaDestinoNombre || '-'} · Estado: {encomiendaEncontrada.estado}
            </div>
          </div>
          <button onClick={() => onSeleccionar(encomiendaEncontrada)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 16px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>edit</span> Registrar / Continuar
          </button>
        </div>
      )}

      <QrScannerModal isOpen={scannerAbierto} onClose={() => setScannerAbierto(false)} onResult={handleQrResult} />
    </div>
  );
};
