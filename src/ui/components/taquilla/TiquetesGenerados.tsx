import React from 'react';
// ─── Este componente debe ser renderizado dentro de <Layout>
// ─── igual que VehiculosPage, FormularioPasajeros, etc.
// ─── Layout ya provee: header global (título, breadcrumb, campana, settings) + sidebar.

interface Tiquete {
  idTiquete: number;
  codigoTiquete: string | null;
  estadoFactura: string;
  pdfBase64: string | null;
}

interface TiquetesGeneradosProps {
  tiquetes: Tiquete[];
  onDescargarPdf: (idTiquete: number) => void;
  onNuevaVenta: () => void;
  viaje?: any;
}

export const TiquetesGenerados: React.FC<TiquetesGeneradosProps> = ({
  tiquetes,
  onDescargarPdf,
  onNuevaVenta,
  viaje: _viaje,
}) => {
  /* ── handlers ── */
  const handleDescargarTodos = () => {
    tiquetes.forEach(t => {
      if (t.pdfBase64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${t.pdfBase64}`;
        link.download = `tiquete-${t.codigoTiquete || t.idTiquete}.pdf`;
        link.click();
      } else {
        onDescargarPdf(t.idTiquete);
      }
    });
  };

  const handleImprimirTodos = () => {
    tiquetes.forEach(t => {
      if (t.pdfBase64) {
        const w = window.open('');
        if (w) w.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${t.pdfBase64}'></iframe>`);
      }
    });
  };

  const handleDescargar = (t: Tiquete) => {
    if (t.pdfBase64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${t.pdfBase64}`;
      link.download = `tiquete-${t.codigoTiquete || t.idTiquete}.pdf`;
      link.click();
    } else {
      onDescargarPdf(t.idTiquete);
    }
  };

  const handleImprimir = (t: Tiquete) => {
    if (t.pdfBase64) {
      const w = window.open('');
      if (w) w.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${t.pdfBase64}'></iframe>`);
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     El render empieza directamente con el contenido de la página,
     igual que VehiculosPage lo hace después de <Layout>.
     Layout renderiza el nav-tab bar, el sidebar y el header superior.
  ───────────────────────────────────────────────────────────────── */
  return (
    <>
    
      {/* ── Nav-tab bar — mismo patrón que VehiculosPage ── */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e8edf2',
        padding: '0 24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            padding: '14px 24px',
            borderBottom: '3px solid #0D3B8E',
            color: '#0D3B8E',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>confirmation_number</span>
            Tiquetes Emitidos
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px 64px',
        minHeight: 'calc(100vh - 180px)',
      }}>

        {/* Check icon */}
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(34,197,94,0.28)',
          border: '4px solid #dcfce7',
        }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 30, color: '#fff', fontVariationSettings: "'wght' 700" }}
          >
            check
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 32,
          fontWeight: 900,
          color: '#0f172a',
          margin: '0 0 10px',
          textAlign: 'center',
          letterSpacing: '-0.5px',
          fontFamily: 'inherit',
        }}>
          ¡Venta Exitosa!
        </h2>
        <p style={{
          fontSize: 13,
          color: '#64748b',
          fontWeight: 500,
          textAlign: 'center',
          margin: '0 0 36px',
          maxWidth: 380,
          lineHeight: 1.6,
          fontFamily: 'inherit',
        }}>
          Los tiquetes han sido generados y están listos para su emisión.
        </p>

        {/* ── Summary card — mismo border-radius/shadow que VehiculosPage ── */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          border: '1px solid #e8edf2',
          width: '100%',
          maxWidth: 680,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>

          {/* Card header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            gap: 12,
            flexWrap: 'wrap' as const,
          }}>
            <div>
              <p style={{
                margin: '0 0 2px',
                fontSize: 10,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                fontFamily: 'inherit',
              }}>
                Resumen de Orden
              </p>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: 'inherit' }}>
                {tiquetes.length} Tiquete{tiquetes.length !== 1 ? 's' : ''} Generado{tiquetes.length !== 1 ? 's' : ''}
              </h3>
            </div>

            {/* Batch buttons — mismo estilo de botones secundarios de VehiculosPage */}
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { label: 'Download All', icon: 'download', fn: handleDescargarTodos },
                { label: 'Print All',    icon: 'print',    fn: handleImprimirTodos  },
              ] as const).map(({ label, icon, fn }) => (
                <button
                  key={label}
                  type="button"
                  onClick={fn}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0D3B8E';
                    e.currentTarget.style.color = '#0D3B8E';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket rows — mismo patrón de filas que la tabla de VehiculosPage */}
          <div style={{ padding: '8px 0' }}>
            {tiquetes.map((t, idx) => (
              <div
                key={t.idTiquete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '12px 24px',
                  borderBottom: idx < tiquetes.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                {/* Number badge — mismo estilo de índice que filas de tabla */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#0D3B8E',
                  fontFamily: 'monospace',
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Ticket icon + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#16a34a' }}>
                      confirmation_number
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 2px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                      fontFamily: 'monospace',
                    }}>
                      {t.codigoTiquete || `#${t.idTiquete}`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* APROBADA badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                        {t.estadoFactura || 'APROBADA'}
                      </span>
                      {/* PDF Listo badge */}
                      {t.pdfBase64 && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: '20px',
                          background: '#eff6ff',
                          color: '#0D3B8E',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>picture_as_pdf</span>
                          PDF Listo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons — mismo estilo icon-button de VehiculosPage */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    title="Descargar PDF"
                    onClick={() => handleDescargar(t)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0D3B8E')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                  </button>
                  <button
                    type="button"
                    title="Imprimir"
                    onClick={() => handleImprimir(t)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0D3B8E')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Card footer — DESCARGAR TODOS + IMPRIMIR TODOS (estilo imagen 1) */}
          <div style={{
            borderTop: '1px solid #e8edf2',
            display: 'flex',
            gap: 0,
          }}>
            <button
              type="button"
              onClick={handleDescargarTodos}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 0',
                background: '#0D3B8E',
                border: 'none',
                borderRight: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0D3B8E')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              DESCARGAR TODOS ({tiquetes.length})
            </button>
            <button
              type="button"
              onClick={handleImprimirTodos}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 0',
                background: 'white',
                border: 'none',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
              IMPRIMIR TODOS
            </button>
          </div>
        </div>

        {/* ── CTA: Iniciar nueva venta — botón primario igual que VehiculosPage ── */}
        <button
          type="button"
          onClick={onNuevaVenta}
          style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(34,197,94,0.28)',
            transition: 'all 0.2s',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#16a34a';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(34,197,94,0.36)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#22c55e';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.28)';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Iniciar Nueva Venta
        </button>
      </div>
    </>
  );
};