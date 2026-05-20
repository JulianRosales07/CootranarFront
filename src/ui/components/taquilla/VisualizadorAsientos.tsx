import React, { useState, useEffect } from 'react';

interface VisualizadorAsientosProps {
  viaje: any;
  asientos: any[];
  asientosSeleccionados: number[];
  onSeleccionar: (idAsiento: number) => void;
  onContinuar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
  precioBase?: number;
  adicionalPoltrona?: number;
  // Multi-tiquete
  asientosYaSeleccionados?: number[];
  pasajeroIdx?: number;
  totalPasajeros?: number;
  tipoPasajero?: 'adulto' | 'nino';
  modoSingleSeleccion?: boolean;
}

export const VisualizadorAsientos: React.FC<VisualizadorAsientosProps> = ({
  viaje,
  asientos: asientosRaw = [],
  asientosSeleccionados,
  onSeleccionar,
  onContinuar,
  onCancelar,
  cargando = false,
  precioBase,
  adicionalPoltrona,
  asientosYaSeleccionados = [],
  pasajeroIdx: _pasajeroIdx,
  totalPasajeros: _totalPasajeros = 1,
  tipoPasajero: _tipoPasajero,
  modoSingleSeleccion: _modoSingleSeleccion = false,
}) => {
  const [pisoActual, setPisoActual] = useState(1);
  const [distribucionGrid, setDistribucionGrid] = useState<{ distribucion: any[]; columnas: number }>(() => {
    return obtenerDistribucionInicial();
  });

  function generarDistribucionDefault(cap: number) {
    if (!cap || cap <= 0) return [];
    const nuevosAsientos = [];
    const tieneFila5AlFinal = (cap % 4 !== 0) && (cap > 4);
    const rows = tieneFila5AlFinal ? Math.ceil((cap - 5) / 4) + 1 : Math.ceil(cap / 4);
    let numeroAsiento = 0;
    let slotId = 1;
    for (let r = 0; r < rows; r++) {
      const esUltimaFila = r === rows - 1;
      const filaDeCinco = esUltimaFila && tieneFila5AlFinal;
      for (let c = 0; c < 5; c++) {
        const esCeldaPasillo = c === 2 && !filaDeCinco;
        if (esCeldaPasillo) {
          nuevosAsientos.push({ id: slotId++, numero: null, vacio: true, esPasillo: true, esBano: false, esPoltrona: false });
        } else {
          if (numeroAsiento < cap) {
            numeroAsiento++;
            nuevosAsientos.push({ id: slotId++, numero: numeroAsiento, vacio: false, esPasillo: false, esBano: false, esPoltrona: false });
          } else {
            nuevosAsientos.push({ id: slotId++, numero: null, vacio: true, esPasillo: false, esBano: false, esPoltrona: false });
          }
        }
      }
    }
    return nuevosAsientos;
  }

  function obtenerDistribucionInicial() {
    let raw = viaje?.distribucionasientos;
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && Array.isArray(parsed.distribucion) && typeof parsed.columnas === 'number') {
          return parsed;
        }
      } catch (e) {
        console.error("Error parseando distribucionasientos:", e);
      }
    }
    const cap = asientosRaw.length || viaje?.totalasientos || 40;
    return { distribucion: generarDistribucionDefault(cap), columnas: 5 };
  }

  useEffect(() => {
    setDistribucionGrid(obtenerDistribucionInicial());
  }, [viaje, asientosRaw]);

  const pisos = asientosRaw.length > 0
    ? [...new Set(asientosRaw.map(a => a.piso))].sort((a, b) => (a as number) - (b as number))
    : [1];

  useEffect(() => {
    if (pisos.length > 0 && !pisos.includes(pisoActual)) {
      setPisoActual(pisos[0]);
    }
  }, [asientosRaw, pisos]);

  const handleClickAsiento = (idasientoviaje: number, disponible: boolean) => {
    if (disponible) onSeleccionar(idasientoviaje);
  };

  const { distribucion: celdas, columnas = 5 } = distribucionGrid;

  const fmtFecha = (f: string) => {
    if (!f) return '—';
    const normalized = f.includes('T') ? f : f.replace(/-/g, '/');
    const d = new Date(normalized);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('es-CO', options);
  };

  const formatearHora = (h: string) => {
    if (!h) return '—';
    const [hh, mm] = String(h).split(':').map(Number);
    const p = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, '0')} ${p}`;
  };

  const calcularPrecioAsiento = (seatObj: any) => {
    const base = Number(precioBase || viaje?.precio || viaje?.valortarifa || viaje?.tarifa || 85000);
    if (seatObj?.espoltrona) {
      return base + Number(adicionalPoltrona ?? 20000);
    }
    return base;
  };

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#f0f4f8', minHeight: '100vh', padding: '24px' }}>

      {/* ─── Header Card ─── */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '18px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,53,95,0.08)',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#00355f', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 24 }}>directions_bus</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0b1c30' }}>{viaje?.ciudadorigen || 'Pasto'}</span>
              <span className="material-symbols-outlined" style={{ color: '#8a9ab0', fontSize: 18 }}>arrow_forward</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0b1c30' }}>{viaje?.ciudaddestino || 'Cali'}</span>
            </div>
            <p style={{ fontSize: 12, color: '#5f7080', fontWeight: 500, margin: 0 }}>
              {viaje?.nombretipobus || 'Bus Clásico'} • Vehículo #{viaje?.numeromovil || '1042'} • {fmtFecha(viaje?.fechasalida)}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Hora de Salida</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#0058be', margin: 0 }}>{formatearHora(viaje?.horasalida || '20:30')}</p>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ─── Bus Map ─── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,53,95,0.08)' }}>

          {/* Legend & Floor Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <span style={{
              background: '#eff6ff',
              borderRadius: 100,
              padding: '6px 14px',
              fontSize: 12,
              color: '#5f7080',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
              Toque un asiento para seleccionar
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {pisos.length > 1 && (
                <div style={{ display: 'flex', background: '#eff6ff', borderRadius: 12, padding: 4, gap: 4 }}>
                  {pisos.map(piso => (
                    <button
                      key={piso}
                      type="button"
                      onClick={() => setPisoActual(piso)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 9,
                        border: 'none',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: pisoActual === piso ? '#00355f' : 'transparent',
                        color: pisoActual === piso ? '#fff' : '#5f7080',
                        transition: 'all 0.2s',
                      }}
                    >
                      Piso {piso}
                    </button>
                  ))}
                </div>
              )}

              {/* Mini-legend */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <LegendDot color="#e8f5ee" border="#52b788" label="Libre" />
                <LegendDot color="#00355f" border="#00355f" label="Elegido" textColor="#fff" />
                <LegendDot color="#e8eaed" border="#c5cad3" label="Vendido" textColor="#aaa" />
              </div>
            </div>
          </div>

          {/* The "phone" bus shape */}
          <div style={{
            margin: '0 auto',
            maxWidth: 300,
            background: 'linear-gradient(180deg, #f7faff 0%, #eef3fb 100%)',
            borderRadius: 52,
            padding: '28px 22px 24px',
            border: '3.5px solid #d4e3f7',
            boxShadow: 'inset 0 2px 12px rgba(0,53,95,0.07)',
            position: 'relative',
          }}>
            {/* FRENTE */}
            <div style={{ textAlign: 'right', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: 2, textTransform: 'uppercase' }}>FRENTE</span>
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #b8cde8)', borderRadius: 2, marginTop: 4 }} />
            </div>

            {/* Seat grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columnas}, 1fr)`,
              gap: '8px 6px',
              justifyItems: 'center',
            }}>
              {celdas.map((celda, idx) => {
                const esBaño = celda.esBano;
                const col = idx % columnas;

                const esParteIzquierda = esBaño && (col === 0 || col === 3) && celdas[idx + 1]?.esBano;
                const esParteDerecha = esBaño && (col === 1 || col === 4) && celdas[idx - 1]?.esBano;
                if (esParteDerecha) return null;

                if (celda.vacio && !celda.esPasillo && !esBaño) {
                  return <div key={celda.id} style={{ width: 46, height: 46 }} />;
                }

                if (celda.esPasillo) {
                  return (
                    <div key={celda.id} style={{ width: 12, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 1, height: '100%', borderRight: '1.5px dashed #c5d8f0' }} />
                    </div>
                  );
                }

                if (esBaño) {
                  return (
                    <div
                      key={celda.id}
                      title="Servicio de Baño"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        background: '#e8ecff',
                        border: '1.5px solid #c5cde8',
                        borderRadius: 10,
                        height: 46,
                        gridColumn: esParteIzquierda ? 'span 2' : 'span 1',
                        width: '100%',
                        cursor: 'default',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#6878c0' }}>wc</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6878c0', textTransform: 'uppercase', letterSpacing: 0.5 }}>BAÑO</span>
                    </div>
                  );
                }

                // Regular seat
                const seatData = asientosRaw.find(
                  a => a.numeroasiento === celda.numero && a.piso === pisoActual
                );

                if (!seatData) {
                  return <div key={celda.id} style={{ width: 46, height: 46 }} />;
                }

                const seleccionado = asientosSeleccionados.includes(seatData.idasientoviaje);
                const tomadoPorOtro = asientosYaSeleccionados.includes(seatData.idasientoviaje);
                const esVendido = seatData.estado === 'VENDIDO' || seatData.estado === 'RESERVADO' || tomadoPorOtro;
                const disponible = !esVendido || seleccionado;
                const esPoltrona = seatData.espoltrona;

                // Color scheme matching Image 2
                let bg: string, border: string, numColor: string, iconColor: string;

                if (seleccionado) {
                  bg = '#00355f'; border = '#00355f'; numColor = '#fff'; iconColor = '#fff';
                } else if (tomadoPorOtro) {
                  // Tomado por otro pasajero del mismo grupo — naranja
                  bg = '#fff7ed'; border = '#f97316'; numColor = '#c2410c'; iconColor = '#f97316';
                } else if (esVendido) {
                  bg = '#e8eaed'; border = '#c5cad3'; numColor = '#aab0bb'; iconColor = '#aab0bb';
                } else if (esPoltrona) {
                  bg = '#fef3c7'; border = '#f59e0b'; numColor = '#92400e'; iconColor = '#f59e0b';
                } else {
                  bg = '#d1fae5'; border = '#6ee7b7'; numColor = '#065f46'; iconColor = '#34d399';
                }

                return (
                  <button
                    type="button"
                    key={celda.id}
                    disabled={esVendido && !seleccionado}
                    onClick={() => handleClickAsiento(seatData.idasientoviaje, disponible)}
                    title={`Asiento ${seatData.numeroasiento} - ${seatData.estado}${esPoltrona ? ' (Poltrona)' : ''}`}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 10,
                      border: `2px solid ${border}`,
                      background: bg,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      cursor: esVendido && !seleccionado ? 'not-allowed' : 'pointer',
                      opacity: esVendido && !seleccionado ? 0.45 : 1,
                      transition: 'all 0.15s ease',
                      boxShadow: seleccionado ? '0 4px 12px rgba(0,53,95,0.35)' : '0 2px 5px rgba(0,0,0,0.07)',
                      outline: 'none',
                      padding: 0,
                      position: 'relative',
                      transform: seleccionado ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onMouseEnter={e => {
                      if (!esVendido) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = seleccionado ? 'scale(1.05)' : 'scale(1)';
                    }}
                  >
                    {esPoltrona && !seleccionado && (
                      <span style={{ fontSize: 13, lineHeight: 1 }}>⭐</span>
                    )}
                    {seleccionado && (
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: iconColor, lineHeight: 1 }}>check</span>
                    )}
                    {!esPoltrona && !seleccionado && (
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: iconColor, lineHeight: 1 }}>event_seat</span>
                    )}
                    <span style={{ fontSize: 10, fontWeight: 700, color: numColor, lineHeight: 1 }}>
                      {String(seatData.numeroasiento).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ATRÁS */}
            <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid #d4e3f7' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: 2, textTransform: 'uppercase' }}>ATRÁS</span>
            </div>
          </div>

          {/* Bottom legends */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #eef2f7', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0b1c30', margin: 0, lineHeight: 1 }}>Poltrona</p>
                  <p style={{ fontSize: 10, color: '#8a9ab0', margin: 0, fontWeight: 500 }}>Máximo confort</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#d1fae5', border: '2px solid #6ee7b7', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#34d399' }}>event_seat</span>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0b1c30', margin: 0, lineHeight: 1 }}>Standard</p>
                  <p style={{ fontSize: 10, color: '#8a9ab0', margin: 0, fontWeight: 500 }}>Económico</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#0058be' }}>bolt</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#5f7080' }}>Venta instantánea activa</span>
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Purchase Summary */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,53,95,0.08)', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0b1c30', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#00355f' }}>shopping_basket</span>
              Resumen de Compra
            </h3>

            <div style={{ minHeight: 120, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {asientosSeleccionados.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', opacity: 0.5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#00355f', marginBottom: 8 }}>event_seat</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0b1c30', margin: 0 }}>No hay asientos seleccionados</p>
                </div>
              ) : (
                asientosSeleccionados.map(id => {
                  const seatObj = asientosRaw.find(a => a.idasientoviaje === id);
                  if (!seatObj) return null;
                  const isP = seatObj.espoltrona;
                  return (
                    <div key={id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: '#eff6ff',
                      borderRadius: 12,
                      border: '1px solid #dbeafe',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00355f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                          {String(seatObj.numeroasiento).padStart(2, '0')}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#0b1c30', margin: 0 }}>Asiento {seatObj.numeroasiento}</p>
                          <p style={{ fontSize: 10, color: '#5f7080', fontWeight: 600, margin: 0 }}>{isP ? '⭐ Poltrona Plus' : 'Estándar'}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0b1c30' }}>${calcularPrecioAsiento(seatObj).toLocaleString('es-CO')}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ borderTop: '1px solid #eef2f7', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#5f7080', fontWeight: 600 }}>Asientos</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0b1c30' }}>{asientosSeleccionados.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#00355f' }}>
                  ${(asientosSeleccionados.reduce((acc, id) => {
                    const seatObj = asientosRaw.find(a => a.idasientoviaje === id);
                    return acc + calcularPrecioAsiento(seatObj);
                  }, 0)).toLocaleString('es-CO')}
                </span>
              </div>

              <button
                type="button"
                onClick={onContinuar}
                disabled={asientosSeleccionados.length === 0 || cargando}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  borderRadius: 14,
                  border: 'none',
                  background: asientosSeleccionados.length > 0 ? '#0058be' : '#c5cad3',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: asientosSeleccionados.length > 0 && !cargando ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                  transition: 'all 0.2s',
                  boxShadow: asientosSeleccionados.length > 0 ? '0 4px 14px rgba(0,88,190,0.35)' : 'none',
                }}
              >
                {cargando ? 'Reservando...' : 'Confirmar Asientos'}
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={onCancelar}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  borderRadius: 14,
                  border: '1.5px solid #d4dde8',
                  background: '#fff',
                  color: '#5f7080',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Cancelar Operación
              </button>
            </div>
          </div>

          {/* Fleet Card */}
          <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: 108, background: '#0f4c81', boxShadow: '0 2px 12px rgba(0,53,95,0.18)', display: 'flex', alignItems: 'center' }}>
            <img
              alt="Bus visual reference"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, position: 'absolute', inset: 0 }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6OmHPgg6GWC-UoWyVQY5YbX0qf7RebYsnuw6FxEOB3bKohJeaU9qc8s6e-aJBThjAQ6Nc_EjLzfuYHJXxWsX-PGW_bYR_1Sj45aBqQEF9a7r6ilT-sf5vpmtJ5B47oZs2EuGG1SPl2cFUykbMICQEt3ERn8nKPuEmj36pq-wU1DDYdNY4sICQ0P8SxSU78gISuf1cVrB2kMlop-Pq8z2q_Ju4rkNvHKcbaxJ07hNRRVFGs2WFnVCYgGr7WfWvTLkSuLh0Qt-ZesgC"
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f4c81 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 16 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>COOTRANAR Fleet</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 13, margin: 0 }}>Poltrona Plus Series</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component
function LegendDot({ color, border, label, textColor = '#0b1c30' }: { color: string; border: string; label: string; textColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 14, height: 14, borderRadius: 4, background: color, border: `2px solid ${border}` }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: textColor }}>{label}</span>
    </div>
  );
}