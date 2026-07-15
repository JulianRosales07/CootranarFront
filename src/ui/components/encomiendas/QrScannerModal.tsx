import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_ELEMENT_ID = 'encomienda-qr-scanner';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
}

export const QrScannerModal = ({ isOpen, onClose, onResult }: QrScannerModalProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setError(null);

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled) return;
          onResult(decodedText);
        },
        () => {
          // Ignorar errores de frames sin QR detectado
        }
      )
      .catch((err) => {
        if (!cancelled) {
          setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
          console.error('[QrScannerModal] Error al iniciar cámara:', err);
        }
      });

    return () => {
      cancelled = true;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current) {
        current.stop().then(() => current.clear()).catch(() => {
          // El escáner ya pudo haberse detenido
        });
      }
    };
  }, [isOpen, onResult]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: '360px', maxWidth: '90vw', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Escanear código QR</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
        <div style={{ padding: '16px' }}>
          <div id={SCANNER_ELEMENT_ID} style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', background: '#0f172a' }} />
          {error && (
            <p style={{ marginTop: '12px', fontSize: '12.5px', color: '#dc2626', fontWeight: 600, textAlign: 'center' }}>{error}</p>
          )}
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
            Apunta la cámara al código QR de la encomienda.
          </p>
        </div>
      </div>
    </div>
  );
};
