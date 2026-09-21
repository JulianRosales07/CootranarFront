import { useMemo, useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';

/**
 * Selector de asientos de solo lectura con la carrocería y el lenguaje visual
 * de DisenadorAsientos (cabina, pasillo, baño, poltronas), pero pintando la
 * disponibilidad real del viaje.
 *
 * Convención de colores del proyecto (ver src/__tests__/bugCondition-colores-asientos.test.ts):
 *   LIBRE = blanco · SELECCIONADO = verde · VENDIDO = azul · RESERVADO = amarillo
 */

export interface AsientoViajeUI {
  idasientoviaje: number;
  numeroasiento: number;
  piso: number;
  espoltrona: boolean;
  estado: string;
}

interface SlotDistribucion {
  id: number;
  numero: number | string | null;
  vacio?: boolean;
  esPasillo?: boolean;
  esBano?: boolean;
  esPoltrona?: boolean;
}

interface Props {
  /** Viaje destino; se usa distribucionasientos para dibujar la carrocería. */
  viaje: { distribucionasientos?: unknown; totalasientos?: number } | null;
  asientos: AsientoViajeUI[];
  idAsientoSeleccionado: number | null;
  onSeleccionar: (idAsientoViaje: number) => void;
  /** Asiento que ocupa hoy el tiquete: se puede volver a elegir. */
  idAsientoActual?: number | null;
  cargando?: boolean;
}

// ── Distribución por defecto cuando el vehículo no tiene una guardada ────────
const generarDistribucionDefault = (capacidad: number): SlotDistribucion[] => {
  if (!capacidad || capacidad <= 0) return [];
  const slots: SlotDistribucion[] = [];
  const tieneFila5AlFinal = capacidad % 4 !== 0 && capacidad > 4;
  const filas = tieneFila5AlFinal ? Math.ceil((capacidad - 5) / 4) + 1 : Math.ceil(capacidad / 4);

  let numero = 0;
  let id = 1;
  for (let f = 0; f < filas; f++) {
    const filaDeCinco = f === filas - 1 && tieneFila5AlFinal;
    for (let c = 0; c < 5; c++) {
      const esPasillo = c === 2 && !filaDeCinco;
      if (esPasillo) {
        slots.push({ id: id++, numero: null, vacio: true, esPasillo: true });
      } else if (numero < capacidad) {
        numero++;
        slots.push({ id: id++, numero, vacio: false, esPasillo: false });
      } else {
        slots.push({ id: id++, numero: null, vacio: true, esPasillo: false });
      }
    }
  }
  return slots;
};

const parsearDistribucion = (
  viaje: Props['viaje'],
  cantidadAsientos: number
): { distribucion: SlotDistribucion[]; columnas: number } => {
  const raw = viaje?.distribucionasientos;
  if (raw) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && Array.isArray(parsed.distribucion) && typeof parsed.columnas === 'number') {
        return { distribucion: parsed.distribucion, columnas: parsed.columnas };
      }
    } catch {
      // Distribución corrupta: se cae al layout estándar
    }
  }
  const capacidad = cantidadAsientos || Number(viaje?.totalasientos ?? 0) || 40;
  return { distribucion: generarDistribucionDefault(capacidad), columnas: 5 };
};

export const SelectorAsientosBus = ({
  viaje,
  asientos,
  idAsientoSeleccionado,
  onSeleccionar,
  idAsientoActual = null,
  cargando = false,
}: Props) => {
  const { theme } = useSidebar();
  const isDark = theme === 'dark';

  const pisos = useMemo(
    () => [...new Set(asientos.map(a => Number(a.piso ?? 1)))].sort((a, b) => a - b),
    [asientos]
  );
  // El piso se deriva en lugar de sincronizarse con un efecto: si el elegido ya
  // no existe (cambió el viaje) se cae al primero disponible sin re-render extra.
  const [pisoElegido, setPisoElegido] = useState<number | null>(null);
  const pisoActual = pisoElegido != null && pisos.includes(pisoElegido) ? pisoElegido : pisos[0] ?? 1;

  const asientosDelPiso = useMemo(
    () => asientos.filter(a => Number(a.piso ?? 1) === pisoActual),
    [asientos, pisoActual]
  );

  // El layout se indexa por número de asiento; cada piso reutiliza la misma carrocería
  const porNumero = useMemo(() => {
    const mapa = new Map<number, AsientoViajeUI>();
    for (const a of asientosDelPiso) mapa.set(Number(a.numeroasiento), a);
    return mapa;
  }, [asientosDelPiso]);

  const { distribucion, columnas } = useMemo(
    () => parsearDistribucion(viaje, asientosDelPiso.length),
    [viaje, asientosDelPiso.length]
  );

  const disponibles = asientosDelPiso.filter(
    a => a.estado === 'LIBRE' || a.idasientoviaje === idAsientoActual
  ).length;

  // ── Paleta por estado ──────────────────────────────────────────────────────
  const estiloAsiento = (asiento: AsientoViajeUI | undefined, esPoltronaLayout: boolean) => {
    const seleccionado = asiento != null && asiento.idasientoviaje === idAsientoSeleccionado;
    const esActual = asiento != null && asiento.idasientoviaje === idAsientoActual;
    const estado = asiento?.estado ?? 'NO_EXISTE';
    const esPoltrona = Boolean(asiento?.espoltrona ?? esPoltronaLayout);

    if (seleccionado) {
      return { fondo: '#22c55e', borde: '2px solid #16a34a', texto: '#ffffff', habilitado: true };
    }
    if (esActual) {
      return {
        fondo: isDark ? 'rgba(59, 130, 246, 0.3)' : '#dbeafe',
        borde: '2px dashed #3b82f6',
        texto: isDark ? '#93c5fd' : '#1d4ed8',
        habilitado: true,
      };
    }
    if (estado === 'RESERVADO') {
      return { fondo: '#facc15', borde: '2px solid #eab308', texto: '#713f12', habilitado: false };
    }
    if (estado === 'VENDIDO') {
      return { fondo: '#0e3a8c', borde: '2px solid #0e3a8c', texto: '#ffffff', habilitado: false };
    }
    if (estado === 'NO_EXISTE') {
      return {
        fondo: isDark ? '#18181b' : '#f8fafc',
        borde: isDark ? '2px dashed #3f3f46' : '2px dashed #cbd5e1',
        texto: isDark ? '#71717a' : '#94a3b8',
        habilitado: false,
      };
    }
    if (esPoltrona) {
      return {
        fondo: isDark ? 'linear-gradient(to bottom, #78350f, #451a03)' : 'linear-gradient(to bottom, #fef3c7, #fde68a)',
        borde: '2px solid #f59e0b',
        texto: isDark ? '#fef08a' : '#92400e',
        habilitado: true,
      };
    }
    return {
      fondo: isDark ? 'linear-gradient(to bottom, #27272a, #18181b)' : 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
      borde: isDark ? '1px solid #3f3f46' : '1px solid #cbd5e1',
      texto: isDark ? '#ffffff' : '#0f172a',
      habilitado: true,
    };
  };

  if (cargando) {
    return (
      <div style={{
        padding: '40px 20px', textAlign: 'center', borderRadius: '16px',
        background: isDark ? '#18181b' : '#f8fafc',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        fontFamily: "'Hanken Grotesk', sans-serif", color: isDark ? '#94a3b8' : '#64748b', fontSize: '13px',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '30px', display: 'block', marginBottom: '8px' }}>
          progress_activity
        </span>
        Cargando asientos del viaje…
      </div>
    );
  }

  if (asientos.length === 0) {
    return (
      <div style={{
        padding: '32px 20px', textAlign: 'center', borderRadius: '16px',
        background: isDark ? '#18181b' : '#f8fafc',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        fontFamily: "'Hanken Grotesk', sans-serif", color: isDark ? '#94a3b8' : '#64748b', fontSize: '13px',
      }}>
        Selecciona el tramo para ver los asientos.
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '16px', overflow: 'hidden',
      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
      fontFamily: "'Hanken Grotesk', sans-serif",
    }}>
      {/* Barra superior: pisos, disponibilidad y leyenda */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '12px 16px',
        background: isDark ? '#18181b' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {pisos.length > 1 && (
            <div style={{
              display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px',
              background: isDark ? '#27272a' : '#e2e8f0',
            }}>
              {pisos.map(piso => (
                <button
                  key={piso}
                  type="button"
                  onClick={() => setPisoElegido(piso)}
                  style={{
                    padding: '5px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    fontSize: '11.5px', fontWeight: 800, fontFamily: 'inherit',
                    background: pisoActual === piso ? '#00355f' : 'transparent',
                    color: pisoActual === piso ? '#fff' : (isDark ? '#cbd5e1' : '#475569'),
                  }}
                >
                  Piso {piso}
                </button>
              ))}
            </div>
          )}
          <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
            {disponibles} {disponibles === 1 ? 'asiento disponible' : 'asientos disponibles'} en este tramo
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Leyenda color={isDark ? '#27272a' : '#ffffff'} borde={isDark ? '#3f3f46' : '#cbd5e1'} label="Libre" isDark={isDark} />
          <Leyenda color="#22c55e" borde="#16a34a" label="Elegido" isDark={isDark} />
          <Leyenda color="#0e3a8c" borde="#0e3a8c" label="Vendido" isDark={isDark} />
          <Leyenda color="#facc15" borde="#eab308" label="Reservado" isDark={isDark} />
          {idAsientoActual != null && (
            <Leyenda color={isDark ? 'rgba(59,130,246,0.3)' : '#dbeafe'} borde="#3b82f6" label="Actual" isDark={isDark} />
          )}
        </div>
      </div>

      {/* Área de la carrocería */}
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '28px 16px',
        backgroundImage: isDark
          ? 'radial-gradient(#27272a 1px, transparent 1px)'
          : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundColor: isDark ? '#09090b' : '#f8fafc',
      }}>
        <div style={{
          position: 'relative', width: '100%', maxWidth: '330px',
          backgroundColor: isDark ? '#121215' : '#ffffff',
          borderRadius: '44px', padding: '22px 18px 26px',
          border: isDark ? '8px solid #27272a' : '8px solid #f1f5f9',
          boxShadow: isDark ? '0 20px 50px -12px rgba(0,0,0,0.6)' : '0 20px 50px -12px rgba(0,0,0,0.15)',
        }}>
          {/* Toldo / parabrisas */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '170px', height: '36px',
            background: isDark
              ? 'linear-gradient(to bottom, rgba(39, 39, 42, 0.8), transparent)'
              : 'linear-gradient(to bottom, rgba(226, 232, 240, 0.6), transparent)',
            borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px',
          }} />

          {/* Cabina */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginTop: '10px', marginBottom: '26px', paddingBottom: '18px',
            borderBottom: isDark ? '2px dashed #27272a' : '2px dashed #e2e8f0',
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #334155, #0f172a)', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(-12deg)',
              border: isDark ? '4px solid #18181b' : '4px solid #f8fafc',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '25px' }}>steering_wheel_heat</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.6 }}>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.25em', color: isDark ? '#cbd5e1' : '#64748b' }}>
                FRENTE
              </span>
              <div style={{ width: '36px', height: '5px', borderRadius: '9999px', marginTop: '5px', backgroundColor: isDark ? '#3f3f46' : '#cbd5e1' }} />
            </div>
          </div>

          {/* Grid de asientos */}
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${columnas}, 1fr)`,
            rowGap: '10px', columnGap: '7px', paddingBottom: '8px',
          }}>
            {distribucion.map((slot, idx) => {
              const col = idx % columnas;
              const esBano = Boolean(slot.esBano);

              // Un baño doble ocupa dos celdas: se dibuja en la izquierda con span 2
              const esParteIzquierda = esBano && (col === 0 || col === 3) && Boolean(distribucion[idx + 1]?.esBano);
              const esParteDerecha = esBano && (col === 1 || col === 4) && Boolean(distribucion[idx - 1]?.esBano);
              if (esParteDerecha) return null;

              if (esBano) {
                return (
                  <div
                    key={slot.id}
                    title="Baño"
                    style={{
                      gridColumn: esParteIzquierda ? 'span 2' : 'auto',
                      aspectRatio: esParteIzquierda ? 'auto' : '1',
                      minHeight: '40px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: isDark ? 'rgba(168, 85, 247, 0.25)' : '#faf5ff',
                      border: isDark ? '2px solid #a855f7' : '2px solid #d8b4fe',
                      color: isDark ? '#d8b4fe' : '#7e22ce',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>wc</span>
                    {esParteIzquierda && (
                      <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px' }}>BAÑO</span>
                    )}
                  </div>
                );
              }

              if (slot.esPasillo) {
                return <div key={slot.id} style={{ aspectRatio: '1', minHeight: '40px' }} />;
              }

              const numero = Number(slot.numero);
              if (!slot.numero || Number.isNaN(numero)) {
                // Posición oculta en el diseño del vehículo
                return (
                  <div
                    key={slot.id}
                    style={{
                      aspectRatio: '1', minHeight: '40px', borderRadius: '10px',
                      background: isDark ? '#18181b' : '#f8fafc',
                      border: isDark ? '2px dashed #3f3f46' : '2px dashed #cbd5e1',
                      boxSizing: 'border-box',
                    }}
                  />
                );
              }

              const asiento = porNumero.get(numero);
              const { fondo, borde, texto, habilitado } = estiloAsiento(asiento, Boolean(slot.esPoltrona));
              const esActual = asiento != null && asiento.idasientoviaje === idAsientoActual;
              const esPoltrona = Boolean(asiento?.espoltrona ?? slot.esPoltrona);

              const titulo = !asiento
                ? `Asiento ${numero}: no registrado en este viaje`
                : esActual
                ? `Asiento ${numero}: asiento actual del tiquete`
                : asiento.estado === 'VENDIDO'
                ? `Asiento ${numero}: vendido en este tramo`
                : asiento.estado === 'RESERVADO'
                ? `Asiento ${numero}: reservado en una venta en curso`
                : `Asiento ${numero}${esPoltrona ? ' · poltrona' : ''}: disponible`;

              return (
                <button
                  key={slot.id}
                  type="button"
                  title={titulo}
                  aria-label={titulo}
                  aria-pressed={asiento != null && asiento.idasientoviaje === idAsientoSeleccionado}
                  disabled={!habilitado}
                  onClick={() => habilitado && asiento && onSeleccionar(asiento.idasientoviaje)}
                  style={{
                    position: 'relative', aspectRatio: '1', minHeight: '40px', width: '100%',
                    borderRadius: '10px', boxSizing: 'border-box', padding: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '1px', lineHeight: 1.05,
                    background: fondo, border: borde, color: texto,
                    fontSize: '13px', fontWeight: 900, fontFamily: 'inherit',
                    cursor: habilitado ? 'pointer' : 'not-allowed',
                    opacity: habilitado ? 1 : 0.85,
                    boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => { if (habilitado) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: texto }}>
                    {numero}
                    {esPoltrona && (
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#f59e0b' }}>star</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Leyenda = ({ color, borde, label, isDark }: { color: string; borde: string; label: string; isDark: boolean }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
    <span style={{ width: '13px', height: '13px', borderRadius: '4px', background: color, border: `1.5px solid ${borde}`, display: 'inline-block' }} />
    {label}
  </span>
);

export default SelectorAsientosBus;
