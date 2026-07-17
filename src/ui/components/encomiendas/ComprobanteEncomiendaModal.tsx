import React, { useEffect } from 'react';

const BLUE = '#0D3B8E';

interface ComprobanteEncomienda {
  referencia?: string;
  nombreDestinatario?: string;
  valorCobrado?: number;
  pdfBase64?: string | null;
}

interface ComprobanteEncomiendaModalProps {
  comprobante: ComprobanteEncomienda | null;
  onClose: () => void;
}

const formatPeso = (v?: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

/**
 * Muestra el comprobante de registro de encomienda y descarga automáticamente
 * el PDF generado por el backend en base64.
 */
export const ComprobanteEncomiendaModal: React.FC<ComprobanteEncomiendaModalProps> = ({ comprobante, onClose }) => {
  useEffect(() => {
    if (comprobante?.pdfBase64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${comprobante.pdfBase64}`;
      link.download = `comprobante-encomienda-${comprobante.referencia || 'nuevo'}.pdf`;
      link.click();
    }
  }, [comprobante]);

  if (!comprobante) return null;

  const handleImprimir = () => {
    if (!comprobante.pdfBase64) return;
    const w = window.open('');
    if (w) w.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${comprobante.pdfBase64}'></iframe>`);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', textAlign: 'center', padding: '32px 28px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#16a34a' }}>check_circle</span>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px' }}>Encomienda registrada</h3>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 18px' }}>
          Referencia <strong style={{ color: '#0f172a' }}>{comprobante.referencia}</strong> para {comprobante.nombreDestinatario}
        </p>
        {comprobante.valorCobrado != null && (
          <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '12px', marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>Valor cobrado</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e40af' }}>{formatPeso(comprobante.valorCobrado)}</div>
          </div>
        )}
        {comprobante.pdfBase64 ? (
          <p style={{ fontSize: '11.5px', color: '#16a34a', marginBottom: '18px' }}>El comprobante PDF se descargó automáticamente.</p>
        ) : (
          <p style={{ fontSize: '11.5px', color: '#dc2626', marginBottom: '18px' }}>No se pudo generar el comprobante PDF, pero la encomienda quedó registrada.</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {comprobante.pdfBase64 && (
            <button onClick={handleImprimir} style={{ background: 'white', color: BLUE, border: `1px solid ${BLUE}`, borderRadius: '7px', padding: '9px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Imprimir
            </button>
          )}
          <button onClick={onClose} style={{ background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
