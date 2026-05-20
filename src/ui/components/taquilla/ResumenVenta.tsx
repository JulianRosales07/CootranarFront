import React, { useState, useEffect } from 'react';

const BLUE = '#1a56db';

interface AsientoVenta {
  idasientoviaje: number;
  numero: number;
  espoltrona: boolean;
  pasajero: {
    idusuario?: number;
    nombre: string;
    apellido: string;
    documento: string;
    tipodocumento?: string;
  };
  puntoOrigen?: { idpuntoruta: number; nombre: string };
  puntoDestino?: { idpuntoruta: number; nombre: string };
  precio: number;
  esNino?: boolean;
  tipoPasajero?: 'adulto' | 'nino';
}

interface ResumenVentaProps {
  viaje: any;
  asientos: AsientoVenta[];
  onConfirmar: (metodoPago: number, formaPago: 'CONTADO' | 'CREDITO') => void;
  onVolver: () => void;
  onAnular?: () => void;
  onEditar?: () => void;
  cargando?: boolean;
  metodosPago: Array<{ idmetodopago: number; nombre: string; icono?: string }>;
  // Multi-tiquete
  configuracionGrupo?: { adultos: number; ninos: number } | null;
}

function fmtFecha(f: string) {
  if (!f) return '—';
  const d = new Date(f.includes('T') ? f : f.replace(/-/g, '/'));
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtHora(h: string) {
  if (!h) return '—';
  const [hh, mm] = String(h).split(':').map(Number);
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}

function getIcon(nombre: string) {
  const l = nombre.toLowerCase();
  if (l.includes('efectivo')) return 'payments';
  if (l.includes('tarjeta')) return 'credit_card';
  if (l.includes('nequi') || l.includes('daviplata') || l.includes('dav')) return 'smartphone';
  if (l.includes('convenio') || l.includes('empresa')) return 'business_center';
  if (l.includes('transferencia') || l.includes('pse') || l.includes('banco')) return 'account_balance';
  return 'monetization_on';
}

function initials(nombre: string, apellido: string) {
  return `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();
}

const avatarColors = ['#3b82f6','#8b5cf6','#ec4899','#f97316','#14b8a6','#84cc16'];

export const ResumenVenta: React.FC<ResumenVentaProps> = ({
  viaje,
  asientos,
  onConfirmar,
  onVolver,
  onAnular,
  onEditar,
  cargando = false,
  metodosPago,
  configuracionGrupo: _configuracionGrupo,
}) => {
  const [metodoPago, setMetodoPago] = useState<number>(0);
  const [formaPago, setFormaPago] = useState<'CONTADO'|'CREDITO'>('CONTADO');

  useEffect(() => {
    if (metodosPago.length > 0) setMetodoPago(metodosPago[0].idmetodopago);
  }, [metodosPago]);

  const total = asientos.reduce((s, a) => s + Number(a.precio), 0);
  const tasasTerminal = Math.round(total * 0.02);
  const tarifaBase = total - tasasTerminal;
  const iva = 0;

  const s: Record<string, React.CSSProperties> = {
    page: { fontFamily: "'Inter','Segoe UI',sans-serif", background: '#f3f4f6', minHeight: '100vh', padding: '0 0 40px' },
    topBar: { padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', background: '#fff', borderBottom: '1px solid #e5e7eb' },
    sep: { color: '#d1d5db' },
    pageTitle: { padding: '16px 24px 0', fontSize: 20, fontWeight: 800, color: '#111827' },
    body: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, padding: '16px 24px', alignItems: 'start', maxWidth: 1000, margin: '0 auto' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 12 },
    cardHead: { padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardBody: { padding: '16px 18px' },
    label: { fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: 0.6 },
    val: { fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 2 },
    th: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: 0.4, padding: '0 10px 10px 0', textAlign: 'left' as const },
    td: { fontSize: 13, fontWeight: 600, color: '#111827', padding: '10px 10px 10px 0', verticalAlign: 'middle' as const, borderTop: '1px solid #f3f4f6' },
  };

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <div style={s.topBar}>
        <span>Ventas</span><span style={s.sep}> › </span>
        <span>Emisión de Tiquete</span><span style={s.sep}> › </span>
        <span style={{ color: '#111827', fontWeight: 700 }}>Resumen de Pago</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 12px' }}>
            COOTRANAR Operativo
          </span>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>print</span>
          </button>
        </div>
      </div>

      <div style={s.pageTitle}>Resumen de Pago</div>

      <div style={s.body}>
        {/* ═══ LEFT ═══ */}
        <div>

          {/* Detalles del Viaje */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: BLUE }}>directions_bus</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Detalles del Viaje</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, background: '#eff6ff', border: `1px solid #bfdbfe`, borderRadius: 20, padding: '3px 12px' }}>
                Ruta: {viaje?.ciudadorigen?.toUpperCase() || 'PASTO'} – {viaje?.ciudaddestino?.toUpperCase() || 'CALI'}
              </span>
            </div>
            <div style={{ ...s.cardBody, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              <div>
                <div style={s.label}>Fecha & Hora</div>
                <div style={s.val}>{fmtFecha(viaje?.fechasalida)} –</div>
                <div style={{ ...s.val, color: '#374151' }}>{fmtHora(viaje?.horasalida)}</div>
              </div>
              <div>
                <div style={s.label}>Vehículo</div>
                <div style={s.val}>Interno {viaje?.numeromovil || '402'}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>({viaje?.nombretipobus || 'Standard'})</div>
              </div>
              <div>
                <div style={s.label}>Puestos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {asientos.map(a => (
                    <span key={a.idasientoviaje} style={{ padding: '2px 8px', background: '#eff6ff', color: BLUE, borderRadius: 6, fontSize: 12, fontWeight: 700, border: '1px solid #bfdbfe' }}>
                      {String(a.numero).padStart(2,'0')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={s.label}>Conductor</div>
                <div style={s.val}>{viaje?.conductor || 'Rodrigo Mendoza'}</div>
              </div>
            </div>
          </div>

          {/* Pasajeros */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: BLUE }}>group</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Pasajeros</span>
              </div>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{asientos.length} Pasajeros Registrados</span>
            </div>
            <div style={s.cardBody}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={s.th}>Pasajero</th>
                    <th style={s.th}>Tipo</th>
                    <th style={s.th}>Identificación</th>
                    <th style={s.th}>Tramo</th>
                    <th style={{ ...s.th, textAlign: 'right' as const }}>Valor Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {asientos.map((a, i) => (
                    <tr key={a.idasientoviaje}>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: avatarColors[i % avatarColors.length],
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, flexShrink: 0,
                          }}>
                            {initials(a.pasajero.nombre, a.pasajero.apellido)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>
                              {a.pasajero.nombre} {a.pasajero.apellido}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Asiento {String(a.numero).padStart(2,'0')}{a.espoltrona ? ' • Poltrona' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: (a.tipoPasajero === 'nino' || a.esNino) ? '#f5f3ff' : '#eff6ff',
                          color: (a.tipoPasajero === 'nino' || a.esNino) ? '#7c3aed' : '#1a56db',
                          border: `1px solid ${(a.tipoPasajero === 'nino' || a.esNino) ? '#ddd6fe' : '#bfdbfe'}`,
                        }}>
                          {(a.tipoPasajero === 'nino' || a.esNino) ? '👶 Niño' : '🧑 Adulto'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          <div>{a.pasajero.tipodocumento || 'CC'} {a.pasajero.documento}</div>
                        </div>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' as const }}>
                        {a.puntoOrigen && a.puntoDestino ? (
                          <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                            {a.puntoOrigen.nombre?.split(' ').slice(-1)[0]} → {a.puntoDestino.nombre?.split(' ').slice(-1)[0]}
                          </span>
                        ) : <span style={{ color: '#d1d5db' }}>-</span>}
                      </td>
                      <td style={{ ...s.td, textAlign: 'right' as const }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>
                          ${Number(a.precio).toLocaleString('es-CO')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Método de Pago */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: BLUE }}>payments</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Método de Pago</span>
              </div>
            </div>
            <div style={{ ...s.cardBody, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {metodosPago.map(m => {
                const sel = metodoPago === m.idmetodopago;
                return (
                  <button
                    key={m.idmetodopago}
                    type="button"
                    onClick={() => setMetodoPago(m.idmetodopago)}
                    style={{
                      padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${sel ? BLUE : '#e5e7eb'}`,
                      background: sel ? '#eff6ff' : '#fff',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      minWidth: 90, transition: 'all 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: sel ? BLUE : '#9ca3af' }}>
                      {getIcon(m.nombre)}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: sel ? BLUE : '#374151' }}>{m.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {onAnular && (
                <button type="button" onClick={onAnular} style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span> Anular
                </button>
              )}
              {onEditar && (
                <button type="button" onClick={onEditar} style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span> Editar
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onVolver}
              style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Volver a Pasajeros
            </button>
          </div>
        </div>

        {/* ═══ RIGHT ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Condición de venta */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Condición de Venta</p>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
              {(['CONTADO','CREDITO'] as const).map(fp => (
                <button
                  key={fp}
                  type="button"
                  onClick={() => setFormaPago(fp)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${formaPago === fp ? BLUE : '#e5e7eb'}`,
                    background: formaPago === fp ? BLUE : '#fff',
                    color: formaPago === fp ? '#fff' : '#374151',
                    fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                  }}
                >
                  {fp === 'CONTADO' ? 'Contado' : 'Crédito'}
                </button>
              ))}
            </div>
          </div>

          {/* Total a Pagar box */}
          <div style={{ background: BLUE, borderRadius: 12, padding: '20px 18px', color: '#fff' }}>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total a Pagar</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Tarifa Base (x{asientos.length})</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>${tarifaBase.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Tasas de Terminal</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>${tasasTerminal.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>IVA (19% incl.)</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>${iva.toLocaleString('es-CO')}</span>
              </div>

            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>TOTAL</span>
                <span style={{ fontSize: 26, fontWeight: 900 }}>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onConfirmar(metodoPago, formaPago)}
              disabled={cargando || !metodoPago}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 10, border: '2px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
                cursor: cargando || !metodoPago ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: cargando || !metodoPago ? 0.6 : 1,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s',
              }}
            >
              {cargando ? (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>progress_activity</span> Procesando...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> Emitir Tiquetes</>
              )}
            </button>
          </div>

          {/* Anular / Editar shortcuts */}
          <div style={{ display: 'flex', gap: 8 }}>
            {onAnular && (
              <button type="button" onClick={onAnular} style={{ flex: 1, padding: '10px 0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>cancel</span> Anular
              </button>
            )}
            {onEditar && (
              <button type="button" onClick={onEditar} style={{ flex: 1, padding: '10px 0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span> Editar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '12px 24px', fontSize: 11, color: '#9ca3af', borderTop: '1px solid #e5e7eb', background: '#fff', marginTop: 20 }}>
        © 2024 TransitFlow Systems. All rights reserved.
        <span style={{ margin: '0 16px' }}>Support Center</span>
        <span style={{ marginRight: 16 }}>API Docs</span>
        <span>Privacy Policy</span>
      </div>
    </div>
  );
};