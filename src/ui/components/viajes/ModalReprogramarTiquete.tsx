import { useCallback, useEffect, useState } from 'react';
import taquillaApiService from '../../../infrastructure/services/taquillaApi';
import asientosApiService from '../../../infrastructure/services/asientosApi';
import metodosPagoApiService from '../../../infrastructure/services/metodosPagoApi';
import { rutasApi } from '../../../infrastructure/services/rutasApi';
import { SelectorAsientosBus } from './SelectorAsientosBus';

// ── Paleta (misma que GestionTiquetesPage) ───────────────────────────────────
const C = {
  primary:             '#00355f',
  primaryContainer:    '#0f4c81',
  secondary:           '#0058be',
  secondaryFixed:      '#d8e2ff',
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

const fmtFecha = (f?: string) => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtHora = (h?: string) => {
  if (!h) return '—';
  const [hh, mm] = String(h).split(':').map(Number);
  const p = hh >= 12 ? 'p.m.' : 'a.m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${p}`;
};
const fmtMoneda = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

// ── Tipos ────────────────────────────────────────────────────────────────────
export interface TiqueteReprogramable {
  idtiquete: number;
  codigotiquete?: string;
  idasientoviaje?: number;
  numeroasiento: number;
  piso?: number;
  espoltrona?: boolean;
  valorcobrado: number;
  nombre?: string;
  apellido?: string;
  tipodocumento?: string;
  numerodocumento?: string;
  origentramo?: string;
  destinotramo?: string;
  vecesreprogramado?: number;
}

export interface ViajeOrigenResumen {
  idviaje: number;
  ciudadorigen?: string;
  ciudaddestino?: string;
  fechasalida?: string;
  horasalida?: string;
  numeromovil?: string;
  placa?: string;
}

interface PuntoRuta {
  idpuntoruta: number;
  nombre: string;
  orden: number;
}

interface AsientoDisponible {
  idasientoviaje: number;
  numeroasiento: number;
  piso: number;
  espoltrona: boolean;
  estado: string;
  idtipobus?: number;
}

interface MetodoPago {
  idmetodopago: number;
  nombre: string;
}

interface Props {
  tiquete: TiqueteReprogramable;
  viajeActual: ViajeOrigenResumen | null;
  onClose: () => void;
  onExito: (mensaje: string) => void;
}

type Paso = 'buscar' | 'seleccion' | 'confirmar';

// ── Estilos compartidos ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: `1.5px solid ${C.outlineVariant}`, borderRadius: '9px',
  fontSize: '13.5px', fontFamily: FONT, color: C.onSurface, background: '#fff',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10.5px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px', fontFamily: FONT,
};

const botonPrimario = (deshabilitado: boolean): React.CSSProperties => ({
  padding: '11px 20px', background: C.primary, color: '#fff', border: 'none',
  borderRadius: '10px', fontSize: '14px', fontWeight: 800, fontFamily: FONT,
  cursor: deshabilitado ? 'not-allowed' : 'pointer', opacity: deshabilitado ? 0.55 : 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
});

const botonSecundario: React.CSSProperties = {
  padding: '11px 18px', background: '#fff', color: C.primary,
  border: `1.5px solid ${C.outlineVariant}`, borderRadius: '10px',
  fontSize: '14px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '6px',
};

const PASOS: { id: Paso; label: string }[] = [
  { id: 'buscar', label: 'Nuevo viaje' },
  { id: 'seleccion', label: 'Tramo y asiento' },
  { id: 'confirmar', label: 'Confirmar' },
];

// ── Componente ───────────────────────────────────────────────────────────────
export const ModalReprogramarTiquete = ({ tiquete, viajeActual, onClose, onExito }: Props) => {
  const [paso, setPaso] = useState<Paso>('buscar');
  const [error, setError] = useState<string | null>(null);

  // Paso 1: búsqueda del viaje destino
  const [origen, setOrigen] = useState(viajeActual?.ciudadorigen ?? '');
  const [destino, setDestino] = useState(viajeActual?.ciudaddestino ?? '');
  const [fecha, setFecha] = useState('');
  const [viajes, setViajes] = useState<any[]>([]);
  const [cargandoViajes, setCargandoViajes] = useState(false);
  const [busquedaHecha, setBusquedaHecha] = useState(false);

  // Paso 2: tramo y asiento
  const [viajeDestino, setViajeDestino] = useState<any | null>(null);
  const [puntosRuta, setPuntosRuta] = useState<PuntoRuta[]>([]);
  const [idPuntoOrigen, setIdPuntoOrigen] = useState<number | ''>('');
  const [idPuntoDestino, setIdPuntoDestino] = useState<number | ''>('');
  const [asientos, setAsientos] = useState<AsientoDisponible[]>([]);
  const [cargandoAsientos, setCargandoAsientos] = useState(false);
  const [idAsientoNuevo, setIdAsientoNuevo] = useState<number | null>(null);

  // Tarifa del tramo nuevo
  const [valorTramoNuevo, setValorTramoNuevo] = useState<number | null>(null);
  const [cargandoTarifa, setCargandoTarifa] = useState(false);
  const [errorTarifa, setErrorTarifa] = useState<string | null>(null);

  // Paso 3: confirmación
  const [motivo, setMotivo] = useState('');
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [idMetodoPago, setIdMetodoPago] = useState<number | ''>('');
  const [formaPago, setFormaPago] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [enviando, setEnviando] = useState(false);

  const valorPagado = Number(tiquete.valorcobrado ?? 0);
  const asientoNuevo = asientos.find(a => a.idasientoviaje === idAsientoNuevo) ?? null;
  const diferencia = valorTramoNuevo !== null ? Math.round((valorTramoNuevo - valorPagado) * 100) / 100 : null;
  const requiereCobro = diferencia !== null && diferencia > 0;
  const esMismoViaje = viajeDestino && viajeActual && Number(viajeDestino.idviaje) === Number(viajeActual.idviaje);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Métodos de pago (solo se usan si hay diferencia a cobrar)
  useEffect(() => {
    metodosPagoApiService.obtenerActivos()
      .then(res => setMetodosPago(res.data?.data?.metodosPago || res.data?.data || []))
      .catch(() => setMetodosPago([]));
  }, []);

  // ── Paso 1: buscar viajes ──────────────────────────────────────────────────
  const handleBuscar = useCallback(async () => {
    setCargandoViajes(true);
    setError(null);
    setViajes([]);
    try {
      const res = await taquillaApiService.buscarViajes({
        ciudadorigen: origen || undefined,
        ciudaddestino: destino || undefined,
        fecha: fecha || undefined,
      });
      setViajes(res.data?.data?.viajes || []);
      setBusquedaHecha(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron buscar los viajes.');
    } finally {
      setCargandoViajes(false);
    }
  }, [origen, destino, fecha]);

  // ── Paso 2: elegir viaje destino y precargar el tramo ─────────────────────
  const handleSeleccionarViajeDestino = useCallback(async (viaje: any) => {
    setError(null);
    setViajeDestino(viaje);
    setAsientos([]);
    setIdAsientoNuevo(null);
    setValorTramoNuevo(null);
    setErrorTarifa(null);
    setPuntosRuta([]);
    setIdPuntoOrigen('');
    setIdPuntoDestino('');
    setPaso('seleccion');

    try {
      const res = await rutasApi.obtenerPuntos(viaje.idruta);
      const puntos: PuntoRuta[] = (res.data?.data?.puntos || res.data?.puntos || [])
        .slice()
        .sort((a: PuntoRuta, b: PuntoRuta) => a.orden - b.orden);
      setPuntosRuta(puntos);

      if (puntos.length >= 2) {
        const porNombre = (nombre?: string) =>
          nombre ? puntos.find(p => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()) : undefined;

        // Se intenta conservar el mismo tramo que compró el pasajero
        const po = porNombre(tiquete.origentramo)
          ?? puntos.find(p => p.idpuntoruta === viaje.idpuntoorigen_buscado)
          ?? puntos[0];
        const pdCandidato = porNombre(tiquete.destinotramo)
          ?? puntos.find(p => p.idpuntoruta === viaje.idpuntodestino_buscado)
          ?? puntos[puntos.length - 1];
        const pd = pdCandidato.orden > po.orden
          ? pdCandidato
          : puntos[puntos.length - 1];

        setIdPuntoOrigen(po.idpuntoruta);
        setIdPuntoDestino(pd.idpuntoruta);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los puntos de la ruta del viaje destino.');
    }
  }, [tiquete.origentramo, tiquete.destinotramo]);

  // Cargar asientos cada vez que cambia el tramo
  useEffect(() => {
    if (!viajeDestino || !idPuntoOrigen || !idPuntoDestino) return;

    let cancelado = false;
    setCargandoAsientos(true);
    setIdAsientoNuevo(null);
    setValorTramoNuevo(null);
    setErrorTarifa(null);

    asientosApiService
      .obtenerAsientosViajePorTramo(viajeDestino.idviaje, Number(idPuntoOrigen), Number(idPuntoDestino))
      .then(res => {
        if (cancelado) return;
        const lista = res.data?.data?.asientos || res.data?.asientos || [];
        setAsientos(lista);
      })
      .catch((err: any) => {
        if (cancelado) return;
        setAsientos([]);
        setError(err.response?.data?.message || 'No se pudieron cargar los asientos del viaje destino.');
      })
      .finally(() => { if (!cancelado) setCargandoAsientos(false); });

    return () => { cancelado = true; };
  }, [viajeDestino, idPuntoOrigen, idPuntoDestino]);

  // Tarifa del tramo nuevo: depende del piso del asiento elegido
  useEffect(() => {
    if (!viajeDestino || !idPuntoOrigen || !idPuntoDestino || !asientoNuevo) return;

    const idTipoBus = viajeDestino.idtipobus ?? asientoNuevo.idtipobus;
    if (!idTipoBus) {
      setErrorTarifa('No se pudo determinar el tipo de bus del viaje destino.');
      return;
    }

    let cancelado = false;
    setCargandoTarifa(true);
    setErrorTarifa(null);

    taquillaApiService
      .obtenerTarifaTramo(Number(idPuntoOrigen), Number(idPuntoDestino), Number(idTipoBus), asientoNuevo.piso ?? 1)
      .then(res => {
        if (cancelado) return;
        const tarifa = res.data?.data?.tarifa;
        if (!tarifa) {
          setErrorTarifa('No hay tarifa configurada para este tramo.');
          setValorTramoNuevo(null);
          return;
        }
        const base = Number(tarifa.valorBase ?? tarifa.valorNormal ?? tarifa.valornormal ?? 0);
        const adicional = Number(tarifa.adicionalPoltrona ?? tarifa.adicionalpoltrona ?? 0);
        setValorTramoNuevo(asientoNuevo.espoltrona ? base + adicional : base);
      })
      .catch((err: any) => {
        if (cancelado) return;
        setValorTramoNuevo(null);
        setErrorTarifa(err.response?.data?.message || 'No se pudo calcular la tarifa del tramo nuevo.');
      })
      .finally(() => { if (!cancelado) setCargandoTarifa(false); });

    return () => { cancelado = true; };
  }, [viajeDestino, idPuntoOrigen, idPuntoDestino, asientoNuevo]);

  // ── Paso 3: confirmar ──────────────────────────────────────────────────────
  const handleConfirmar = useCallback(async () => {
    if (!viajeDestino || !idAsientoNuevo) return;
    if (motivo.trim().length < 5) {
      setError('Escribe el motivo de la reprogramación (mínimo 5 caracteres).');
      return;
    }
    if (requiereCobro && !idMetodoPago) {
      setError('Selecciona el método de pago con el que se cobra la diferencia.');
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      const res = await taquillaApiService.reprogramarTiquete(tiquete.idtiquete, {
        idViajeNuevo: viajeDestino.idviaje,
        idAsientoViajeNuevo: idAsientoNuevo,
        idPuntoOrigen: Number(idPuntoOrigen),
        idPuntoDestino: Number(idPuntoDestino),
        motivo: motivo.trim(),
        ...(requiereCobro ? { idMetodoPago: Number(idMetodoPago), formaPago } : {}),
      });

      const r = res.data?.data?.reprogramacion;
      const detalleAsiento = r?.nuevo?.numeroAsiento ?? asientoNuevo?.numeroasiento;
      const detalleFecha = fmtFecha(r?.nuevo?.fechaSalida ?? viajeDestino.fechasalida);
      const detalleHora = fmtHora(r?.nuevo?.horaSalida ?? viajeDestino.horasalida);
      const cobro = r?.valores?.diferenciaCobrada
        ? ` Se cobró una diferencia de ${fmtMoneda(Number(r.valores.diferenciaCobrada))}.`
        : '';

      onExito(
        `Tiquete ${tiquete.codigotiquete || `#${tiquete.idtiquete}`} reprogramado al ${detalleFecha} ` +
        `a las ${detalleHora}, asiento ${detalleAsiento}.${cobro}`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo reprogramar el tiquete.');
    } finally {
      setEnviando(false);
    }
  }, [viajeDestino, idAsientoNuevo, idPuntoOrigen, idPuntoDestino, motivo, requiereCobro, idMetodoPago,
      formaPago, tiquete, asientoNuevo, onExito]);

  // ── Helpers de render ──────────────────────────────────────────────────────
  const campoResumen = (label: string, valor: string) => (
    <div key={label}>
      <p style={{ ...labelStyle, marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '13.5px', fontWeight: 600, color: C.onSurface, margin: 0, fontFamily: FONT }}>{valor}</p>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Reprogramar tiquete"
        style={{
          background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '820px',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '21px' }}>event_repeat</span>
              </div>
              <div>
                <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.75)', margin: 0, fontFamily: FONT, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Reprogramar tiquete
                </p>
                <p style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: FONT }}>
                  {tiquete.codigotiquete || `#${tiquete.idtiquete}`} · {tiquete.nombre} {tiquete.apellido}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: FONT }}>
              El pasajero conserva el dinero pagado ({fmtMoneda(valorPagado)}). No se hacen devoluciones.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#fff', display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Stepper */}
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 26px', background: C.surfaceContainerLow,
          borderBottom: `1px solid ${C.outlineVariant}`, flexWrap: 'wrap',
        }}>
          {PASOS.map((p, i) => {
            const idxActual = PASOS.findIndex(x => x.id === paso);
            const activo = i === idxActual;
            const completado = i < idxActual;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: activo ? C.primary : completado ? C.success : '#fff',
                  border: `1.5px solid ${activo ? C.primary : completado ? C.success : C.outlineVariant}`,
                  color: activo || completado ? '#fff' : C.outline,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, fontFamily: FONT,
                }}>
                  {completado ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '12.5px', fontWeight: activo ? 800 : 600, fontFamily: FONT,
                  color: activo ? C.primary : C.onSurfaceVariant,
                }}>{p.label}</span>
                {i < PASOS.length - 1 && (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: C.outlineVariant }}>chevron_right</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '20px 26px', overflowY: 'auto', flex: 1 }}>
          {/* Tiquete actual, siempre visible */}
          <div style={{
            background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`,
            borderRadius: '12px', padding: '14px 16px', marginBottom: '18px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px',
          }}>
            {campoResumen('Viaje actual', viajeActual
              ? `${fmtFecha(viajeActual.fechasalida)} · ${fmtHora(viajeActual.horasalida)}`
              : '—')}
            {campoResumen('Asiento actual', `Nº ${tiquete.numeroasiento}${tiquete.espoltrona ? ' · Poltrona' : ''}`)}
            {campoResumen('Tramo actual', `${tiquete.origentramo ?? '—'} → ${tiquete.destinotramo ?? '—'}`)}
            {campoResumen('Valor pagado', fmtMoneda(valorPagado))}
          </div>

          {error && (
            <div style={{
              background: C.errorBg, border: '1px solid #fca5a5', borderRadius: '10px',
              padding: '11px 14px', marginBottom: '16px', display: 'flex', gap: '9px', alignItems: 'flex-start',
              color: C.error, fontSize: '13px', fontWeight: 600, fontFamily: FONT,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── PASO 1: buscar viaje destino ── */}
          {paso === 'buscar' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle} htmlFor="rp-origen">Ciudad origen</label>
                  <input id="rp-origen" value={origen} onChange={e => setOrigen(e.target.value)} placeholder="Ej: Pasto" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="rp-destino">Ciudad destino</label>
                  <input id="rp-destino" value={destino} onChange={e => setDestino(e.target.value)} placeholder="Ej: Cali" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="rp-fecha">Fecha de salida</label>
                  <input id="rp-fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={handleBuscar} disabled={cargandoViajes} style={{ ...botonPrimario(cargandoViajes), width: '100%' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                    {cargandoViajes ? 'Buscando…' : 'Buscar'}
                  </button>
                </div>
              </div>

              {cargandoViajes && (
                <p style={{ textAlign: 'center', color: C.onSurfaceVariant, fontFamily: FONT, fontSize: '13px', padding: '20px' }}>
                  Buscando viajes disponibles…
                </p>
              )}

              {!cargandoViajes && busquedaHecha && viajes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 20px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '34px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                  <p style={{ margin: 0, fontSize: '13.5px' }}>No hay viaje disponible con esos criterios. Prueba con otra fecha.</p>
                </div>
              )}

              {!cargandoViajes && viajes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', maxHeight: '300px', overflowY: 'auto' }}>
                  {viajes.map(v => {
                    const esActual = viajeActual && Number(v.idviaje) === Number(viajeActual.idviaje);
                    return (
                      <button
                        key={v.idviaje}
                        onClick={() => handleSeleccionarViajeDestino(v)}
                        style={{
                          textAlign: 'left', padding: '13px 15px', borderRadius: '11px', cursor: 'pointer',
                          border: `1px solid ${C.outlineVariant}`, background: '#fff', fontFamily: FONT,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                        }}
                      >
                        <div>
                          <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 800, color: C.onSurface }}>
                            {v.ciudadorigen} → {v.ciudaddestino}
                            {esActual && (
                              <span style={{
                                marginLeft: '8px', padding: '2px 8px', borderRadius: '999px', fontSize: '9.5px',
                                fontWeight: 800, background: C.warningBg, color: C.warning, textTransform: 'uppercase',
                              }}>Viaje actual</span>
                            )}
                          </p>
                          <p style={{ margin: 0, fontSize: '12px', color: C.onSurfaceVariant }}>
                            {fmtFecha(v.fechasalida)} · {fmtHora(v.horasalida)} · Móvil {v.numeromovil} · {v.nombretipobus}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 800, color: C.secondary }}>
                            {v.asientoslibrestramo ?? v.asientoslibres} libres
                          </p>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.outline }}>chevron_right</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── PASO 2: tramo y asiento ── */}
          {paso === 'seleccion' && viajeDestino && (
            <>
              <div style={{
                background: C.secondaryFixed, borderRadius: '11px', padding: '12px 15px', marginBottom: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              }}>
                <div style={{ fontFamily: FONT }}>
                  <p style={{ margin: '0 0 2px', fontSize: '10.5px', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Viaje destino
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: C.primary }}>
                    {viajeDestino.ciudadorigen} → {viajeDestino.ciudaddestino} · {fmtFecha(viajeDestino.fechasalida)} · {fmtHora(viajeDestino.horasalida)}
                  </p>
                  {/* onSurfaceVariant y no primaryContainer: el CSS de modo oscuro
                      reasigna este tono y así el texto queda legible en ambos temas */}
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.onSurfaceVariant }}>
                    Móvil {viajeDestino.numeromovil} · {viajeDestino.placa} · {viajeDestino.nombretipobus}
                  </p>
                </div>
                <button onClick={() => setPaso('buscar')} style={botonSecundario}>
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>swap_horiz</span>
                  Cambiar viaje
                </button>
              </div>

              {/* Tramo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={labelStyle} htmlFor="rp-punto-origen">Punto de origen del tramo</label>
                  <select
                    id="rp-punto-origen"
                    value={idPuntoOrigen}
                    onChange={e => {
                      const nuevoOrigen = Number(e.target.value);
                      setIdPuntoOrigen(nuevoOrigen);
                      // El destino debe seguir estando después del origen en la ruta
                      const ordenOrigen = puntosRuta.find(p => p.idpuntoruta === nuevoOrigen)?.orden ?? -1;
                      const ordenDestino = puntosRuta.find(p => p.idpuntoruta === idPuntoDestino)?.orden ?? -1;
                      if (ordenDestino <= ordenOrigen) {
                        const siguiente = puntosRuta.filter(p => p.orden > ordenOrigen);
                        setIdPuntoDestino(siguiente.length > 0 ? siguiente[siguiente.length - 1].idpuntoruta : '');
                      }
                    }}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Seleccionar…</option>
                    {puntosRuta.map(p => (
                      <option key={p.idpuntoruta} value={p.idpuntoruta}>{p.orden}. {p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle} htmlFor="rp-punto-destino">Punto de destino del tramo</label>
                  <select
                    id="rp-punto-destino"
                    value={idPuntoDestino}
                    onChange={e => setIdPuntoDestino(Number(e.target.value))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Seleccionar…</option>
                    {puntosRuta
                      .filter(p => !idPuntoOrigen || p.orden > (puntosRuta.find(x => x.idpuntoruta === idPuntoOrigen)?.orden ?? -1))
                      .map(p => (
                        <option key={p.idpuntoruta} value={p.idpuntoruta}>{p.orden}. {p.nombre}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Asientos */}
              <p style={labelStyle}>Asiento en el viaje destino</p>
              <SelectorAsientosBus
                viaje={viajeDestino}
                asientos={asientos}
                idAsientoSeleccionado={idAsientoNuevo}
                onSeleccionar={setIdAsientoNuevo}
                idAsientoActual={esMismoViaje ? tiquete.idasientoviaje ?? null : null}
                cargando={cargandoAsientos}
              />

              {/* Resumen de tarifa */}
              {asientoNuevo && (
                <div style={{
                  marginTop: '6px', padding: '13px 15px', borderRadius: '11px',
                  background: errorTarifa ? C.errorBg : C.surfaceContainerLow,
                  border: `1px solid ${errorTarifa ? '#fca5a5' : C.outlineVariant}`,
                  fontFamily: FONT, fontSize: '13px', color: errorTarifa ? C.error : C.onSurface,
                }}>
                  {cargandoTarifa ? 'Calculando tarifa del tramo…'
                    : errorTarifa ? errorTarifa
                    : valorTramoNuevo !== null && (
                      <span>
                        Asiento <strong>{asientoNuevo.numeroasiento}</strong> · tarifa del tramo{' '}
                        <strong>{fmtMoneda(valorTramoNuevo)}</strong>
                        {diferencia !== null && diferencia > 0 && (
                          <> · diferencia a cobrar <strong style={{ color: C.warning }}>{fmtMoneda(diferencia)}</strong></>
                        )}
                        {diferencia !== null && diferencia < 0 && (
                          <> · el pasajero pagó {fmtMoneda(Math.abs(diferencia))} más, no hay devolución</>
                        )}
                        {diferencia === 0 && <> · sin diferencia de valor</>}
                      </span>
                    )}
                </div>
              )}
            </>
          )}

          {/* ── PASO 3: confirmar ── */}
          {paso === 'confirmar' && viajeDestino && asientoNuevo && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ border: `1px solid ${C.outlineVariant}`, borderRadius: '12px', padding: '13px 15px', background: '#fff' }}>
                  <p style={{ ...labelStyle, color: C.error }}>Deja de viajar en</p>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: C.onSurface, fontFamily: FONT }}>
                    {fmtFecha(viajeActual?.fechasalida)} · {fmtHora(viajeActual?.horasalida)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12.5px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                    Asiento {tiquete.numeroasiento} · {tiquete.origentramo} → {tiquete.destinotramo}
                  </p>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '26px', color: C.secondary }}>east</span>
                <div style={{ border: `2px solid ${C.secondary}`, borderRadius: '12px', padding: '13px 15px', background: '#f0f5ff' }}>
                  <p style={{ ...labelStyle, color: C.success }}>Pasa a viajar en</p>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: C.primary, fontFamily: FONT }}>
                    {fmtFecha(viajeDestino.fechasalida)} · {fmtHora(viajeDestino.horasalida)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12.5px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                    Asiento {asientoNuevo.numeroasiento} ·{' '}
                    {puntosRuta.find(p => p.idpuntoruta === idPuntoOrigen)?.nombre} →{' '}
                    {puntosRuta.find(p => p.idpuntoruta === idPuntoDestino)?.nombre}
                  </p>
                </div>
              </div>

              {/* Dinero */}
              <div style={{
                border: `1px solid ${C.outlineVariant}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '18px',
              }}>
                {[
                  { label: 'Valor pagado por el pasajero', valor: fmtMoneda(valorPagado), destacado: false },
                  { label: 'Tarifa del tramo nuevo', valor: valorTramoNuevo !== null ? fmtMoneda(valorTramoNuevo) : '—', destacado: false },
                ].map(f => (
                  <div key={f.label} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 15px',
                    borderBottom: `1px solid ${C.outlineVariant}`, fontFamily: FONT, fontSize: '13.5px',
                  }}>
                    <span style={{ color: C.onSurfaceVariant }}>{f.label}</span>
                    <span style={{ fontWeight: 700, color: C.onSurface }}>{f.valor}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', padding: '12px 15px', fontFamily: FONT, fontSize: '14px',
                  background: requiereCobro ? C.warningBg : C.successBg,
                  color: requiereCobro ? C.warning : C.success, fontWeight: 800,
                }}>
                  <span>
                    {requiereCobro ? 'Diferencia a cobrar ahora'
                      : diferencia !== null && diferencia < 0 ? 'Saldo a favor (no se devuelve)'
                      : 'Sin diferencia de valor'}
                  </span>
                  <span>{diferencia !== null && diferencia !== 0 ? fmtMoneda(Math.abs(diferencia)) : fmtMoneda(0)}</span>
                </div>
              </div>

              {requiereCobro && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle} htmlFor="rp-metodo-pago">Método de pago de la diferencia *</label>
                    <select
                      id="rp-metodo-pago"
                      value={idMetodoPago}
                      onChange={e => setIdMetodoPago(Number(e.target.value))}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Seleccionar…</option>
                      {metodosPago.map(m => (
                        <option key={m.idmetodopago} value={m.idmetodopago}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="rp-forma-pago">Forma de pago</label>
                    <select
                      id="rp-forma-pago"
                      value={formaPago}
                      onChange={e => setFormaPago(e.target.value as 'CONTADO' | 'CREDITO')}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="CONTADO">Contado</option>
                      <option value="CREDITO">Crédito</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle} htmlFor="rp-motivo">Motivo de la reprogramación *</label>
                <textarea
                  id="rp-motivo"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Ej: el pasajero solicitó cambio de fecha por motivos personales"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.onSurfaceVariant, fontFamily: FONT }}>
                  {motivo.trim().length}/300 · queda registrado en el historial del tiquete
                </p>
              </div>

              <div style={{
                background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`, borderRadius: '11px',
                padding: '11px 14px', fontSize: '12.5px', color: C.onSurfaceVariant, fontFamily: FONT,
                display: 'flex', gap: '9px', alignItems: 'flex-start',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.secondary, flexShrink: 0 }}>info</span>
                <span>
                  El tiquete conserva su número de factura. Se regenera el PDF con los datos del viaje nuevo y,
                  si el pasajero tiene correo registrado, se le reenvía automáticamente.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 26px', borderTop: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow,
          display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
        }}>
          <button
            onClick={paso === 'buscar' ? onClose : () => { setError(null); setPaso(paso === 'confirmar' ? 'seleccion' : 'buscar'); }}
            style={botonSecundario}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
              {paso === 'buscar' ? 'close' : 'arrow_back'}
            </span>
            {paso === 'buscar' ? 'Cancelar' : 'Atrás'}
          </button>

          {paso === 'seleccion' && (
            <button
              onClick={() => { setError(null); setPaso('confirmar'); }}
              disabled={!idAsientoNuevo || valorTramoNuevo === null || cargandoTarifa}
              style={botonPrimario(!idAsientoNuevo || valorTramoNuevo === null || cargandoTarifa)}
            >
              Continuar
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          )}

          {paso === 'confirmar' && (
            <button
              onClick={handleConfirmar}
              disabled={enviando || motivo.trim().length < 5 || (requiereCobro && !idMetodoPago)}
              style={botonPrimario(enviando || motivo.trim().length < 5 || (requiereCobro && !idMetodoPago))}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {enviando ? 'progress_activity' : 'event_repeat'}
              </span>
              {enviando ? 'Reprogramando…' : 'Confirmar reprogramación'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalReprogramarTiquete;
