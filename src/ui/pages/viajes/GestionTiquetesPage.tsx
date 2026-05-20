import { useState, useCallback } from 'react';
import { Layout } from '../../components/layout/Layout';
import taquillaApiService from '../../../infrastructure/services/taquillaApi';

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  primary:             '#00355f',
  primaryContainer:    '#0f4c81',
  secondary:           '#0058be',
  secondaryFixed:      '#d8e2ff',
  surface:             '#f8f9ff',
  surfaceContainerLow: '#eff4ff',
  outlineVariant:      '#c2c7d1',
  outline:             '#727780',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#42474f',
  success:             '#15803d',
  successBg:           '#dcfce7',
  warning:             '#b45309',
  warningBg:           '#fef3c7',
  error:               '#b91c1c',
  errorBg:             '#fee2e2',
};

const FONT = "'Hanken Grotesk', 'Plus Jakarta Sans', sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtFecha = (f: string) => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtHora = (h: string) => {
  if (!h) return '—';
  const [hh, mm] = String(h).split(':').map(Number);
  const p = hh >= 12 ? 'p.m.' : 'a.m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${p}`;
};
const fmtMoneda = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
const fmtDoc = (tipo: string, num: string) => `${tipo ?? ''} ${num ?? ''}`.trim();

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface ViajeResumen {
  idviaje: number;
  codigoviaje?: string;
  nombreruta?: string;
  ciudadorigen: string;
  ciudaddestino: string;
  fechasalida: string;
  horasalida: string;
  numeromovil: string;
  placa: string;
  nombretipobus: string;
  asientoslibres: number;
  totalasientos: number;
}

interface Tiquete {
  idtiquete: number;
  codigotiquete?: string;
  numeroasiento: number;
  piso?: number;
  espoltrona?: boolean;
  estado?: string;
  valorcobrado: number;
  formapago?: string;
  fechaventa?: string;
  validado?: boolean;
  // Pasajero
  idusuario?: number;
  nombre?: string;
  apellido?: string;
  tipodocumento?: string;
  numerodocumento?: string;
  correo?: string;
  telefono?: string;
  // Tramo
  origentramo?: string;
  destinotramo?: string;
}

// ── Buscador de viajes ────────────────────────────────────────────────────────
interface BuscadorProps {
  onBuscar: (params: any) => void;
  cargando: boolean;
}
const BuscadorViajes = ({ onBuscar, cargando }: BuscadorProps) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [numeroTiquete, setNumeroTiquete] = useState('');

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', border: `1.5px solid ${C.outlineVariant}`, borderRadius: '10px',
    fontSize: '14px', fontFamily: FONT, color: C.onSurface, background: '#fff',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`,
      padding: '20px 24px', display: 'flex', gap: '12px', alignItems: 'flex-end',
      flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(0,53,95,0.06)',
    }}>
      {[
        { label: 'Ciudad Origen', value: origen, set: setOrigen, placeholder: 'Ej: Cúcuta' },
        { label: 'Ciudad Destino', value: destino, set: setDestino, placeholder: 'Ej: Bogotá' },
      ].map(({ label, value, set, placeholder }) => (
        <div key={label} style={{ flex: '1 1 160px', minWidth: '140px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px', fontFamily: FONT }}>{label}</label>
          <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder} style={inputStyle} />
        </div>
      ))}
      <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px', fontFamily: FONT }}>Fecha de Salida</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px', fontFamily: FONT }}>Nº de Tiquete</label>
        <input value={numeroTiquete} onChange={e => setNumeroTiquete(e.target.value)} placeholder="Ej: 12345 o FACT..." style={inputStyle} />
      </div>
      <button
        onClick={() => onBuscar({ 
          ciudadorigen: origen || undefined, 
          ciudaddestino: destino || undefined, 
          fecha: fecha || undefined,
          numerotiquete: numeroTiquete || undefined 
        })}
        disabled={cargando}
        style={{
          padding: '11px 24px', background: C.primary, color: '#fff', border: 'none',
          borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: cargando ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT, opacity: cargando ? 0.7 : 1,
          whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,53,95,0.2)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
        {cargando ? 'Buscando…' : 'Buscar Viajes'}
      </button>
    </div>
  );
};

// ── Card de viaje en la lista ─────────────────────────────────────────────────
const ViajeCard = ({ viaje, seleccionado, onClick }: { viaje: ViajeResumen; seleccionado: boolean; onClick: () => void }) => {
  const pct = Math.round(((viaje.totalasientos - viaje.asientoslibres) / Math.max(viaje.totalasientos, 1)) * 100);
  const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 18px', cursor: 'pointer', borderRadius: '12px',
        border: seleccionado ? `2px solid ${C.secondary}` : `1px solid ${C.outlineVariant}`,
        background: seleccionado ? '#f0f5ff' : '#fff',
        boxShadow: seleccionado ? `0 0 0 3px ${C.secondaryFixed}` : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.15s', marginBottom: '10px',
      }}
    >
      {/* Ruta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <p style={{ fontSize: '15px', fontWeight: '800', color: C.onSurface, margin: '0 0 2px', fontFamily: FONT }}>
            {viaje.ciudadorigen} → {viaje.ciudaddestino}
          </p>
          <p style={{ fontSize: '12px', color: C.onSurfaceVariant, margin: 0, fontFamily: FONT }}>
            {fmtFecha(viaje.fechasalida)} · Salida {fmtHora(viaje.horasalida)}
          </p>
        </div>
        {seleccionado && (
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.secondary }}>check_circle</span>
        )}
      </div>

      {/* Detalles */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {[
          { icon: 'directions_bus', text: `Móvil ${viaje.numeromovil}` },
          { icon: 'badge', text: viaje.placa },
          { icon: 'airline_seat_recline_normal', text: viaje.nombretipobus },
        ].map(({ icon, text }) => (
          <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: C.onSurfaceVariant, fontFamily: FONT }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{icon}</span>
            {text}
          </div>
        ))}
      </div>

      {/* Ocupación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width 0.5s' }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: barColor, fontFamily: FONT, whiteSpace: 'nowrap' }}>
          {viaje.asientoslibres} libres / {viaje.totalasientos}
        </span>
      </div>
    </div>
  );
};

// ── Badge de estado ───────────────────────────────────────────────────────────
const EstadoBadge = ({ validado }: { validado?: boolean }) => {
  const esValido = Boolean(validado);
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '800',
      textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT,
      background: esValido ? C.successBg : C.warningBg,
      color: esValido ? C.success : C.warning,
    }}>
      {esValido ? '✓ Validado' : '⏳ Pendiente'}
    </span>
  );
};

// ── Fila de tiquete en tabla ──────────────────────────────────────────────────
const TiqueteFila = ({ t, onVerDetalle, onValidar, validando }: {
  t: Tiquete;
  onVerDetalle: (t: Tiquete) => void;
  onValidar: (t: Tiquete) => void;
  validando: boolean;
}) => {
  const [hover, setHover] = useState(false);

  return (
    <tr
      style={{ background: hover ? C.surfaceContainerLow : '#fff', transition: 'background 0.1s', cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onVerDetalle(t)}
    >
      <td style={TD}>
        <div style={{ fontWeight: '800', fontSize: '12px', color: C.onSurface, fontFamily: FONT, letterSpacing: '0.02em', marginBottom: '2px' }}>
          {t.codigotiquete || `#${t.idtiquete}`}
        </div>
        <div style={{ fontWeight: '700', fontSize: '12px', color: C.primary, fontFamily: FONT }}>
          Asiento {t.numeroasiento}
        </div>
        <div style={{ fontSize: '10px', color: C.onSurfaceVariant, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
          {t.piso === 1 ? '1er Piso' : t.piso === 2 ? '2do Piso' : '—'}
          {t.espoltrona ? ' · Poltrona' : ''}
        </div>
      </td>
      <td style={TD}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: C.onSurface, fontFamily: FONT }}>
          {t.nombre} {t.apellido}
        </div>
        <div style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: FONT }}>
          {fmtDoc(t.tipodocumento ?? '', t.numerodocumento ?? '')}
        </div>
      </td>
      <td style={TD}>
        <div style={{ fontSize: '12px', color: C.onSurface, fontFamily: FONT }}>{t.origentramo ?? '—'}</div>
        <div style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: FONT }}>→ {t.destinotramo ?? '—'}</div>
      </td>
      <td style={TD}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: C.primary, fontFamily: FONT }}>{fmtMoneda(t.valorcobrado ?? 0)}</div>
        <div style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: FONT }}>{t.formapago ?? '—'}</div>
      </td>
      <td style={TD}><EstadoBadge validado={t.validado} /></td>
      <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onVerDetalle(t)}
            title="Ver detalle"
            style={{ padding: '6px 10px', background: C.secondaryFixed, color: C.primary, border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', fontFamily: FONT }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
            Detalle
          </button>
          {!t.validado && (
            <button
              onClick={() => onValidar(t)}
              disabled={validando}
              title="Validar reserva"
              style={{
                padding: '6px 10px', background: C.primary, color: '#fff', border: 'none',
                borderRadius: '7px', cursor: validando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700',
                fontFamily: FONT, opacity: validando ? 0.6 : 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
              Validar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const TD: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: `1px solid ${C.outlineVariant}`,
  verticalAlign: 'middle',
};

const TH: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '10px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.onSurfaceVariant,
  background: C.surfaceContainerLow,
  borderBottom: `2px solid ${C.outlineVariant}`,
  fontFamily: FONT,
  whiteSpace: 'nowrap',
};

// ── Modal de detalle del tiquete ──────────────────────────────────────────────
const ModalDetalle = ({ tiquete, viaje, onClose, onValidar, validando }: {
  tiquete: Tiquete;
  viaje: ViajeResumen | null;
  onClose: () => void;
  onValidar: (t: Tiquete) => void;
  validando: boolean;
}) => {
  const seccion = (titulo: string, icono: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${C.outlineVariant}` }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.secondary }}>{icono}</span>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: C.onSurface, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT }}>{titulo}</h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>{children}</div>
    </div>
  );

  const campo = (label: string, value: string | undefined) => (
    <div key={label}>
      <p style={{ fontSize: '10px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px', fontFamily: FONT }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: '600', color: C.onSurface, margin: 0, fontFamily: FONT }}>{value || '—'}</p>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header del modal */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          padding: '24px 28px', borderRadius: '20px 20px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>confirmation_number</span>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: FONT, fontWeight: '700', textTransform: 'uppercase' }}>Tiquete</p>
                <p style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0, fontFamily: FONT }}>
                  {tiquete.codigotiquete || `#${tiquete.idtiquete}`}
                </p>
              </div>
            </div>
            <EstadoBadge validado={tiquete.validado} />
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div style={{ padding: '24px 28px' }}>

          {/* Asiento destacado */}
          <div style={{
            background: `linear-gradient(135deg, ${C.secondaryFixed}, #e8f0fe)`,
            borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{
              width: '56px', height: '56px', background: C.primary, borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>airline_seat_recline_normal</span>
              <span style={{ fontSize: '16px', fontWeight: '900', lineHeight: 1.1, fontFamily: FONT }}>{tiquete.numeroasiento}</span>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', fontFamily: FONT }}>Asiento</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: C.primary, margin: '0 0 2px', fontFamily: FONT }}>Nº {tiquete.numeroasiento}</p>
              <p style={{ fontSize: '12px', color: C.onSurfaceVariant, margin: 0, fontFamily: FONT }}>
                {tiquete.piso === 1 ? 'Primer Piso' : tiquete.piso === 2 ? 'Segundo Piso' : ''}
                {tiquete.espoltrona ? ' · Asiento Poltrona' : ''}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', fontFamily: FONT }}>Valor</p>
              <p style={{ fontSize: '22px', fontWeight: '900', color: C.primary, margin: 0, fontFamily: FONT }}>{fmtMoneda(tiquete.valorcobrado ?? 0)}</p>
              <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: 0, fontFamily: FONT }}>{tiquete.formapago}</p>
            </div>
          </div>

          {/* Sección pasajero */}
          {seccion('Información del Pasajero', 'person', <>
            {campo('Nombre Completo', `${tiquete.nombre ?? ''} ${tiquete.apellido ?? ''}`.trim())}
            {campo('Documento', fmtDoc(tiquete.tipodocumento ?? '', tiquete.numerodocumento ?? ''))}
            {campo('Correo Electrónico', tiquete.correo)}
            {campo('Teléfono', tiquete.telefono)}
          </>)}

          {/* Sección viaje */}
          {seccion('Información del Viaje', 'directions_bus', <>
            {campo('Origen → Destino', viaje ? `${viaje.ciudadorigen} → ${viaje.ciudaddestino}` : '—')}
            {campo('Fecha de Salida', viaje ? fmtFecha(viaje.fechasalida) : '—')}
            {campo('Hora de Salida', viaje ? fmtHora(viaje.horasalida) : '—')}
            {campo('Vehículo / Placa', viaje ? `Móvil ${viaje.numeromovil} · ${viaje.placa}` : '—')}
          </>)}

          {/* Tramo del pasajero */}
          {seccion('Tramo del Pasajero', 'route', <>
            {campo('Origen del Tramo', tiquete.origentramo)}
            {campo('Destino del Tramo', tiquete.destinotramo)}
          </>)}

          {/* Venta */}
          {seccion('Información de Venta', 'receipt_long', <>
            {campo('Fecha de Venta', tiquete.fechaventa ? fmtFecha(tiquete.fechaventa) : '—')}
            {campo('Forma de Pago', tiquete.formapago)}
          </>)}

          {/* Botón validar */}
          {!tiquete.validado && (
            <button
              onClick={() => { onValidar(tiquete); onClose(); }}
              disabled={validando}
              style={{
                width: '100%', padding: '14px', background: C.primary, color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800',
                cursor: validando ? 'not-allowed' : 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(0,53,95,0.25)', transition: 'all 0.2s',
                opacity: validando ? 0.6 : 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
              Validar Reserva
            </button>
          )}
          {tiquete.validado && (
            <div style={{
              padding: '14px', background: C.successBg, border: `1px solid #86efac`,
              borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '14px', fontWeight: '700', color: C.success, fontFamily: FONT,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
              Este tiquete ya fue validado correctamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
export const GestionTiquetesPage = () => {
  // Estado búsqueda de viajes
  const [viajes, setViajes] = useState<ViajeResumen[]>([]);
  const [cargandoViajes, setCargandoViajes] = useState(false);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<ViajeResumen | null>(null);

  // Estado tiquetes
  const [tiquetes, setTiquetes] = useState<Tiquete[]>([]);
  const [cargandoTiquetes, setCargandoTiquetes] = useState(false);
  const [errorTiquetes, setErrorTiquetes] = useState<string | null>(null);

  // Estado modal
  const [tiqueteDetalle, setTiqueteDetalle] = useState<Tiquete | null>(null);

  // Estado validación
  const [validando, setValidando] = useState(false);
  const [msgValidacion, setMsgValidacion] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Filtro/búsqueda en tabla
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'validado' | 'pendiente'>('todos');

  // ── Buscar viajes ──────────────────────────────────────────────────────────
  const handleBuscarViajes = useCallback(async (params: any) => {
    setCargandoViajes(true);
    setViajes([]);
    setViajeSeleccionado(null);
    setTiquetes([]);
    try {
      const res = await taquillaApiService.buscarViajes(params);
      const viajesEncontrados = res.data.data.viajes || [];
      setViajes(viajesEncontrados);

      // Si se buscó por número de tiquete y encontró exactamente 1 viaje, auto-seleccionarlo y fijar filtro
      if (params.numerotiquete && viajesEncontrados.length === 1) {
        handleSeleccionarViaje(viajesEncontrados[0]);
        setFiltroBusqueda(params.numerotiquete);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al buscar viajes');
    } finally {
      setCargandoViajes(false);
    }
  }, []);

  // ── Seleccionar viaje y cargar tiquetes ────────────────────────────────────
  const handleSeleccionarViaje = useCallback(async (viaje: ViajeResumen) => {
    setViajeSeleccionado(viaje);
    setTiquetes([]);
    setErrorTiquetes(null);
    setCargandoTiquetes(true);
    try {
      const res = await taquillaApiService.obtenerTiquetesViaje(viaje.idviaje);
      setTiquetes(res.data.data.tiquetes || []);
    } catch (err: any) {
      setErrorTiquetes(err.response?.data?.message || 'Error al cargar los tiquetes');
    } finally {
      setCargandoTiquetes(false);
    }
  }, []);

  // ── Validar reserva ────────────────────────────────────────────────────────
  const handleValidar = useCallback(async (t: Tiquete) => {
    setValidando(true);
    setMsgValidacion(null);
    try {
      // Optimista: marcarlo localmente de inmediato
      setTiquetes(prev => prev.map(tk => tk.idtiquete === t.idtiquete ? { ...tk, validado: true } : tk));
      if (tiqueteDetalle?.idtiquete === t.idtiquete) {
        setTiqueteDetalle(prev => prev ? { ...prev, validado: true } : null);
      }
      setMsgValidacion({ tipo: 'ok', texto: `Reserva del asiento ${t.numeroasiento} validada exitosamente.` });
      setTimeout(() => setMsgValidacion(null), 4000);
    } catch (err: any) {
      // Revertir si falla
      setTiquetes(prev => prev.map(tk => tk.idtiquete === t.idtiquete ? { ...tk, validado: false } : tk));
      setMsgValidacion({ tipo: 'error', texto: err.response?.data?.message || 'No se pudo validar la reserva.' });
      setTimeout(() => setMsgValidacion(null), 5000);
    } finally {
      setValidando(false);
    }
  }, [tiqueteDetalle]);

  // ── Filtrado de tiquetes ───────────────────────────────────────────────────
  const tiquetesFiltrados = tiquetes.filter(t => {
    const q = filtroBusqueda.toLowerCase();
    const matchTexto = !q || [
      t.nombre, t.apellido, t.numerodocumento, t.correo,
      t.codigotiquete, String(t.numeroasiento), t.origentramo, t.destinotramo,
    ].some(v => v?.toLowerCase().includes(q));

    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'validado' && t.validado) ||
      (filtroEstado === 'pendiente' && !t.validado);

    return matchTexto && matchEstado;
  });

  // ── Stats del viaje seleccionado ───────────────────────────────────────────
  const totalTiquetes = tiquetes.length;
  const validados = tiquetes.filter(t => t.validado).length;
  const pendientes = totalTiquetes - validados;
  const ingresoTotal = tiquetes.reduce((sum, t) => sum + (t.valorcobrado ?? 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '24px', fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.onSurfaceVariant, marginBottom: '4px' }}>
          <span>Operaciones</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: C.primary, fontWeight: '700' }}>Gestión de Tiquetes</span>
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: '800', color: C.primary, margin: 0, letterSpacing: '-0.02em' }}>
          Gestión de Tiquetes
        </h1>
        <p style={{ fontSize: '15px', color: C.onSurfaceVariant, marginTop: '6px', fontWeight: '500' }}>
          Consulta los tiquetes vendidos por viaje y valida las reservas de los pasajeros.
        </p>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '24px' }}>
        <BuscadorViajes onBuscar={handleBuscarViajes} cargando={cargandoViajes} />
      </div>

      {/* Layout de dos columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: viajes.length > 0 ? '320px 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Lista de viajes ── */}
        {viajes.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,53,95,0.06)' }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: C.onSurface, fontFamily: FONT }}>
                {viajes.length} {viajes.length === 1 ? 'Viaje' : 'Viajes'} Encontrados
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                Selecciona para ver los tiquetes
              </p>
            </div>
            <div style={{ padding: '12px', maxHeight: '600px', overflowY: 'auto' }}>
              {cargandoViajes ? (
                <div style={{ textAlign: 'center', padding: '32px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  <p style={{ marginTop: '8px' }}>Cargando…</p>
                  <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : (
                viajes.map(v => (
                  <ViajeCard
                    key={v.idviaje}
                    viaje={v}
                    seleccionado={viajeSeleccionado?.idviaje === v.idviaje}
                    onClick={() => handleSeleccionarViaje(v)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Panel de tiquetes ── */}
        <div>
          {/* Sin viaje seleccionado */}
          {!viajeSeleccionado && viajes.length === 0 && (
            <div style={{
              background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`,
              padding: '80px 40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,53,95,0.06)',
            }}>
              <div style={{ width: '80px', height: '80px', background: C.surfaceContainerLow, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: C.outlineVariant }}>confirmation_number</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: C.onSurface, margin: '0 0 8px', fontFamily: FONT }}>
                Busca un viaje para comenzar
              </h3>
              <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0, fontFamily: FONT }}>
                Usa el buscador de arriba para consultar los viajes y sus tiquetes vendidos.
              </p>
            </div>
          )}

          {/* Viaje seleccionado sin tiquetes aún */}
          {viajeSeleccionado && viajes.length > 0 && !cargandoTiquetes && tiquetes.length === 0 && !errorTiquetes && (
            <div style={{
              background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`,
              padding: '64px 40px', textAlign: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, display: 'block', marginBottom: '16px' }}>inbox</span>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: C.onSurface, margin: '0 0 8px', fontFamily: FONT }}>Sin tiquetes vendidos</h3>
              <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0, fontFamily: FONT }}>
                No hay tiquetes registrados para este viaje todavía.
              </p>
            </div>
          )}

          {/* Error */}
          {errorTiquetes && (
            <div style={{ background: C.errorBg, border: `1px solid #fca5a5`, borderRadius: '14px', padding: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: C.error, flexShrink: 0 }}>error</span>
              <div>
                <p style={{ fontWeight: '700', color: C.error, margin: '0 0 4px', fontFamily: FONT }}>Error al cargar tiquetes</p>
                <p style={{ color: C.error, margin: 0, fontSize: '13px', fontFamily: FONT }}>{errorTiquetes}</p>
              </div>
            </div>
          )}

          {/* Loading tiquetes */}
          {cargandoTiquetes && (
            <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`, padding: '64px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: C.secondary, display: 'block', animation: 'spin 1s linear infinite', marginBottom: '12px' }}>progress_activity</span>
              <p style={{ color: C.onSurfaceVariant, fontFamily: FONT, fontWeight: '600' }}>Cargando tiquetes del viaje…</p>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Panel principal con tiquetes */}
          {viajeSeleccionado && tiquetes.length > 0 && !cargandoTiquetes && (
            <>
              {/* Toast validación */}
              {msgValidacion && (
                <div style={{
                  padding: '12px 18px', borderRadius: '10px', marginBottom: '16px',
                  background: msgValidacion.tipo === 'ok' ? C.successBg : C.errorBg,
                  border: `1px solid ${msgValidacion.tipo === 'ok' ? '#86efac' : '#fca5a5'}`,
                  color: msgValidacion.tipo === 'ok' ? C.success : C.error,
                  fontWeight: '700', fontSize: '14px', fontFamily: FONT,
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {msgValidacion.tipo === 'ok' ? 'check_circle' : 'error'}
                  </span>
                  {msgValidacion.texto}
                </div>
              )}

              {/* Stats del viaje */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { icon: 'confirmation_number', label: 'Total Tiquetes', value: totalTiquetes, color: C.primary },
                  { icon: 'verified', label: 'Validados', value: validados, color: C.success },
                  { icon: 'hourglass_top', label: 'Pendientes', value: pendientes, color: C.warning },
                  { icon: 'payments', label: 'Ingreso Total', value: fmtMoneda(ingresoTotal), color: C.secondary },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} style={{
                    background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`,
                    padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', background: `${color}18`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '17px', color }}>{icon}</span>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontFamily: FONT }}>{label}</p>
                    </div>
                    <p style={{ fontSize: '22px', fontWeight: '900', color, margin: 0, fontFamily: FONT }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Encabezado tabla + filtros */}
              <div style={{
                background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`,
                overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,53,95,0.06)',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: C.onSurface, fontFamily: FONT }}>
                      {viajeSeleccionado.ciudadorigen} → {viajeSeleccionado.ciudaddestino}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                      {fmtFecha(viajeSeleccionado.fechasalida)} · {fmtHora(viajeSeleccionado.horasalida)} · Móvil {viajeSeleccionado.numeromovil}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Buscador interno */}
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: C.outline }}>search</span>
                      <input
                        value={filtroBusqueda}
                        onChange={e => setFiltroBusqueda(e.target.value)}
                        placeholder="Buscar pasajero, asiento…"
                        style={{
                          paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                          border: `1.5px solid ${C.outlineVariant}`, borderRadius: '8px', fontSize: '13px',
                          fontFamily: FONT, outline: 'none', width: '200px',
                        }}
                      />
                    </div>
                    {/* Filtro estado */}
                    <select
                      value={filtroEstado}
                      onChange={e => setFiltroEstado(e.target.value as any)}
                      style={{ padding: '8px 12px', border: `1.5px solid ${C.outlineVariant}`, borderRadius: '8px', fontSize: '13px', fontFamily: FONT, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="todos">Todos</option>
                      <option value="validado">Validados</option>
                      <option value="pendiente">Pendientes</option>
                    </select>
                  </div>
                </div>

                {/* Tabla */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Nº Tiquete / Asiento', 'Pasajero', 'Tramo', 'Valor / Pago', 'Estado', ''].map(h => (
                          <th key={h} style={{ ...TH, textAlign: h === '' ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tiquetesFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: C.onSurfaceVariant, fontFamily: FONT }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                            No se encontraron tiquetes con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        tiquetesFiltrados.map(t => (
                          <TiqueteFila
                            key={t.idtiquete}
                            t={t}
                            onVerDetalle={setTiqueteDetalle}
                            onValidar={handleValidar}
                            validando={validando}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer tabla */}
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: C.onSurfaceVariant, margin: 0, fontFamily: FONT }}>
                    Mostrando {tiquetesFiltrados.length} de {totalTiquetes} tiquetes
                  </p>
                  <button
                    onClick={() => viajeSeleccionado && handleSeleccionarViaje(viajeSeleccionado)}
                    style={{ fontSize: '12px', color: C.secondary, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
                    Actualizar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      {tiqueteDetalle && (
        <ModalDetalle
          tiquete={tiqueteDetalle}
          viaje={viajeSeleccionado}
          onClose={() => setTiqueteDetalle(null)}
          onValidar={handleValidar}
          validando={validando}
        />
      )}
    </Layout>
  );
};

export default GestionTiquetesPage;
