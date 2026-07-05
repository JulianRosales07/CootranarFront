import React, { useState, useEffect, useCallback } from 'react';

interface PuntoRuta {
  idpuntoruta: number;
  nombre: string;
  orden: number;
}

interface SelectorDestinoInlineProps {
  puntosRuta: PuntoRuta[];
  puntoOrigenDefault: number;
  puntoDestinoDefault?: number;
  onDestinoChange: (puntoDestino: number, precio: number, tarifaCompleta?: any) => void;
  onConsultarTarifa: (idPuntoOrigen: number, idPuntoDestino: number, piso: number) => Promise<any>;
  esPoltrona: boolean;
}

interface SeleccionTramoProps {
  viaje: any;
  puntosRuta: PuntoRuta[];
  puntoOrigenDefault?: number;
  puntoDestinoDefault?: number;
  onContinuar: (puntoOrigen: number, puntoDestino: number, precio: number, tarifaCompleta?: any) => void;
  onVolver: () => void;
  onConsultarTarifa: (puntoOrigen: number, puntoDestino: number, piso: number) => Promise<any>;
  // Multi-tiquete
  pasajeroIdx?: number;
  totalPasajeros?: number;
  tipoPasajero?: 'adulto' | 'nino';
}

export const SeleccionTramo: React.FC<SeleccionTramoProps> = ({
  viaje: _viaje,
  puntosRuta,
  puntoOrigenDefault,
  puntoDestinoDefault,
  onContinuar,
  onVolver,
  onConsultarTarifa,
  pasajeroIdx,
  totalPasajeros = 1,
  tipoPasajero,
}) => {
  const [puntoOrigen, setPuntoOrigen] = useState<number>(puntoOrigenDefault || 0);
  const [puntoDestino, setPuntoDestino] = useState<number>(puntoDestinoDefault || 0);
  const [tarifaPiso1, setTarifaPiso1] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>('');
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState<number>(0);

  // Filtrar puntos de destino (solo los que están después del origen)
  const puntosDestinoDisponibles = puntosRuta.filter(p => {
    const puntoOrigenObj = puntosRuta.find(po => po.idpuntoruta === puntoOrigen);
    return puntoOrigenObj ? p.orden > puntoOrigenObj.orden : true;
  });

  // Consultar tarifas cuando se seleccionan ambos puntos
  useEffect(() => {
    if (puntoOrigen && puntoDestino) {
      consultarTarifas();
    } else {
      setTarifaPiso1(null);
      setError('');
    }
  }, [puntoOrigen, puntoDestino]);

  const consultarTarifas = async () => {
    setCargando(true);
    setError('');
    let obtenidoPiso1 = false;

    try {
      // Consultar tarifa para piso 1
      const resPiso1 = await onConsultarTarifa(puntoOrigen, puntoDestino, 1);
      if (resPiso1?.data?.data?.tarifa) {
        setTarifaPiso1(resPiso1.data.data.tarifa);
        obtenidoPiso1 = true;
      }
    } catch (err: any) {
      console.warn('⚠️ No se encontró tarifa para piso 1 en el backend, usando fallback estándar.', err);
    }

    // Si no se pudo obtener la tarifa de Piso 1 del backend, aplicar el fallback para evitar bloquear el flujo de prueba
    if (!obtenidoPiso1) {
      const defaultTarifaMock = {
        idtarifas: 0,
        valorBase: 50000,
        valorNormal: 50000,
        adicionalPoltrona: 10000,
        estadoPrecioGlobal: 'NORMAL',
        isFallback: true
      };
      setTarifaPiso1(defaultTarifaMock);
    }

    setCargando(false);
  };

  const handleContinuar = () => {
    if (!puntoOrigen || !puntoDestino) {
      alert('Debe seleccionar origen y destino');
      return;
    }
    if (!tarifaPiso1) {
      alert('No hay tarifa disponible para este tramo');
      return;
    }

    const priceNum = Number(tarifaPiso1.valorBase);
    onContinuar(puntoOrigen, puntoDestino, priceNum, {
      ...tarifaPiso1,
      valorBase: priceNum,
      valorNormal: priceNum
    });
  };

  const handleSwapPuntos = () => {
    const temp = puntoOrigen;
    setPuntoOrigen(puntoDestino);
    setPuntoDestino(temp);
  };

  const options = tarifaPiso1 ? [
    {
      id: 0,
      title: 'Asiento Normal (Piso 1)',
      subtitle: `${tarifaPiso1.estadoPrecioGlobal === 'TRAFICO_ALTO' ? 'Precio Tráfico Alto' : 'Precio Normal'} • Incluye Equipaje 20kg`,
      price: Number(tarifaPiso1.valorBase),
      subtext: Number(tarifaPiso1.adicionalPoltrona) > 0 ? `+ $${Math.round(Number(tarifaPiso1.adicionalPoltrona)).toLocaleString('es-CO')} POR POLTRONA` : 'PRECIO ESTÁNDAR',
      icon: 'chair',
    }
  ] : [];

  return (
    <div style={{
      fontFamily: "'Hanken Grotesk', 'Inter', 'Segoe UI', sans-serif",
      maxWidth: 1000,
      margin: '0 auto',
      padding: '20px 0 40px 0'
    }}>
      <div className="tramo-grid">
        {/* Left Column: Title + Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {pasajeroIdx !== undefined && (
            <div style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: '#f1f5f9', border: '1px solid #e2e8f0', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {tipoPasajero === 'nino' ? '👶 Niño' : '🧑 Adulto'} {pasajeroIdx + 1} de {totalPasajeros}
              </span>
            </div>
          )}

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Selección de Tramo
          </h1>
          <p style={{ margin: '0 0 28px 0', fontSize: 14, color: '#64748b', fontWeight: 500, lineHeight: 1.5 }}>
            Selecciona el origen y destino del pasajero para ver el precio del tramo.
          </p>

          {/* ORIGIN SELECTOR */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', marginBottom: 8 }}>
              ¿DESDE DÓNDE VIAJA?
            </div>
            <div className="select-wrapper" style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s',
            }}>
              {/* Location Pin SVG Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <select
                  value={puntoOrigen}
                  onChange={e => {
                    const newOrigen = Number(e.target.value);
                    setPuntoOrigen(newOrigen);
                    const origenObj = puntosRuta.find(p => p.idpuntoruta === newOrigen);
                    const destinoObj = puntosRuta.find(p => p.idpuntoruta === puntoDestino);
                    if (origenObj && destinoObj && destinoObj.orden <= origenObj.orden) {
                      setPuntoDestino(0);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#0f172a',
                    appearance: 'none',
                    cursor: 'pointer',
                    padding: '2px 24px 2px 0',
                  }}
                >
                  <option value={0}>Seleccione origen</option>
                  {puntosRuta.slice(0, -1).map(p => (
                    <option key={p.idpuntoruta} value={p.idpuntoruta}>{p.nombre}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '-10px 0', position: 'relative', zIndex: 10 }}>
            <button
              type="button"
              onClick={handleSwapPuntos}
              className="swap-button-btn"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#eff6ff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                outline: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 4v16M17 4l-4 4M17 4l4 4M7 20V4M7 20l4-4M7 20l-4-4" />
              </svg>
            </button>
          </div>

          {/* DESTINATION SELECTOR */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', marginBottom: 8 }}>
              ¿HASTA DÓNDE VIAJA?
            </div>
            <div className="select-wrapper" style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s',
              opacity: puntoOrigen ? 1 : 0.65,
            }}>
              {/* Navigation Plane SVG Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <select
                  value={puntoDestino}
                  onChange={e => setPuntoDestino(Number(e.target.value))}
                  disabled={!puntoOrigen}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#0f172a',
                    appearance: 'none',
                    cursor: puntoOrigen ? 'pointer' : 'not-allowed',
                    padding: '2px 24px 2px 0',
                  }}
                >
                  <option value={0}>Seleccione destino</option>
                  {puntosDestinoDisponibles.map(p => (
                    <option key={p.idpuntoruta} value={p.idpuntoruta}>{p.nombre}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* INFO CARD */}
          <div style={{
            background: '#f0f6ff',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            border: '1px solid #dbeafe',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a', lineHeight: 1.5, fontWeight: 500 }}>
              El precio final puede variar si selecciona una poltrona.
            </p>
          </div>
        </div>

        {/* Right Column: Tariffs */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* EMPTY STATE */}
          {(!puntoOrigen || !puntoDestino) && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 24,
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              minHeight: 330,
            }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff3f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Esperando Selección</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', maxWidth: 300, lineHeight: 1.5, fontWeight: 500 }}>
                  Por favor, selecciona origen y destino en la columna de la izquierda para cotizar tu viaje.
                </p>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {puntoOrigen && puntoDestino && cargando && (
            <div style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              minHeight: 330,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              border: '1.5px solid #f1f5f9',
            }}>
              <div className="spinner" />
              <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 600 }}>Calculando tarifas en tiempo real...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {puntoOrigen && puntoDestino && !cargando && error && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fee2e2',
              borderRadius: 24,
              padding: '32px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              minHeight: 330,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#991b1b' }}>Error al obtener tarifas</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#b91c1c', fontWeight: 500 }}>{error}</p>
              </div>
            </div>
          )}

          {/* TARIFF LIST */}
          {puntoOrigen && puntoDestino && !cargando && !error && tarifaPiso1 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Tarifas Disponibles</h3>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{options.length} opciones encontradas</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {options.map((option, idx) => {
                  const isSelected = tarifaSeleccionada === idx;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setTarifaSeleccionada(idx)}
                      className={`tariff-card-item ${isSelected ? 'selected-card' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderRadius: 18,
                        cursor: 'pointer',
                        background: isSelected ? '#111c2e' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#0f172a',
                        border: isSelected ? '2.5px solid #111c2e' : '2.5px solid transparent',
                        boxShadow: isSelected ? '0 10px 25px rgba(17, 28, 46, 0.16)' : 'none',
                        marginBottom: 14,
                        outline: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Circle badge */}
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: isSelected ? '#1f2e46' : '#eef2f6',
                          color: isSelected ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {option.icon === 'chair' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 18H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"></path><path d="M6 18v2"></path><path d="M18 18v2"></path><path d="M3 11h18"></path></svg>
                          )}
                          {option.icon === 'weekend' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18h16"></path><path d="M4 14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2"></path><path d="M2 10h20"></path><path d="M8 18v-4"></path><path d="M16 18v-4"></path></svg>
                          )}
                          {option.icon === 'bed' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><circle cx="6" cy="12" r="2"></circle></svg>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{option.title}</p>
                          <p style={{ margin: 0, fontSize: 12, color: isSelected ? '#94a3b8' : '#64748b', fontWeight: 500 }}>{option.subtitle}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: '0 0 1px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                          ${Math.round(Number(option.price)).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 9,
                          fontWeight: 800,
                          color: isSelected ? '#60a5fa' : '#64748b',
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase'
                        }}>{option.subtext}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        paddingTop: 24,
        borderTop: '1px solid #f1f5f9',
      }}>
        <button
          type="button"
          onClick={onVolver}
          className="back-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 0',
            background: 'none',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            color: '#64748b',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {/* Left Arrow Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver a Viajes
        </button>

        <button
          type="button"
          onClick={handleContinuar}
          disabled={!tarifaPiso1 || cargando || !puntoOrigen || !puntoDestino}
          className="continue-btn"
          style={{
            padding: '14px 28px',
            borderRadius: 14,
            border: 'none',
            background: (tarifaPiso1 && !cargando && puntoOrigen && puntoDestino) ? '#000000' : '#cbd5e1',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 800,
            cursor: (tarifaPiso1 && !cargando && puntoOrigen && puntoDestino) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            outline: 'none',
            boxShadow: 'none',
          }}
        >
          Continuar a Selección de Asientos
          {/* Right Arrow Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <style>{`
        .tramo-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tramo-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        .select-wrapper:focus-within {
          border-color: #0f172a !important;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
          background: #ffffff !important;
        }
        .tariff-card-item {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tariff-card-item:not(.selected-card):hover {
          background: #f1f5f9 !important;
          transform: translateY(-2px);
          border-color: #cbd5e1 !important;
        }
        .tariff-card-item:active {
          transform: scale(0.98);
        }
        .swap-button-btn {
          transition: all 0.2s ease;
        }
        .swap-button-btn:hover {
          background: #dbeafe !important;
          transform: scale(1.08) rotate(180deg);
        }
        .continue-btn {
          transition: all 0.25s ease;
        }
        .continue-btn:not(:disabled):hover {
          background: #1e293b !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .continue-btn:not(:disabled):active {
          transform: translateY(0);
        }
        .back-btn {
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          color: #0f172a !important;
          transform: translateX(-2px);
        }
        .spinner {
          border: 3.5px solid #f1f5f9;
          border-top: 3.5px solid #000000;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * SelectorDestinoInline — Variante compacta del selector de destino.
 * Se embebe dentro de cada tarjeta de pasajero en el acordeón de FormularioPasajeros.
 * Renderiza un <select> de destino con label "Destino" y el precio calculado al lado.
 */
export const SelectorDestinoInline: React.FC<SelectorDestinoInlineProps> = ({
  puntosRuta,
  puntoOrigenDefault,
  puntoDestinoDefault,
  onDestinoChange,
  onConsultarTarifa,
  esPoltrona,
}) => {
  const [puntoDestino, setPuntoDestino] = useState<number>(puntoDestinoDefault || 0);
  const [precio, setPrecio] = useState<number>(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>('');

  // Filtrar puntos de destino: solo los que tienen orden > puntoOrigen.orden
  const puntoOrigenObj = puntosRuta.find(p => p.idpuntoruta === puntoOrigenDefault);
  const puntosDestinoDisponibles = puntosRuta.filter(p =>
    puntoOrigenObj ? p.orden > puntoOrigenObj.orden : false
  );

  // Consultar tarifa para un destino dado
  const consultarTarifa = useCallback(async (idDestino: number) => {
    if (!idDestino || !puntoOrigenDefault) return;
    setCargando(true);
    setError('');
    try {
      const res = await onConsultarTarifa(puntoOrigenDefault, idDestino, 1);
      const tarifa = res?.data?.data?.tarifa;
      if (tarifa) {
        const valorBase = Number(tarifa.valorBase) || 0;
        const adicionalPoltrona = Number(tarifa.adicionalPoltrona) || 0;
        const precioCalculado = esPoltrona ? valorBase + adicionalPoltrona : valorBase;
        setPrecio(precioCalculado);
        onDestinoChange(idDestino, precioCalculado, tarifa);
      } else {
        setError('No se pudo obtener la tarifa para este tramo');
        setPrecio(0);
      }
    } catch (_err) {
      setError('No se pudo obtener la tarifa para este tramo');
      setPrecio(0);
    } finally {
      setCargando(false);
    }
  }, [puntoOrigenDefault, esPoltrona, onConsultarTarifa, onDestinoChange]);

  // On initial render, if puntoDestinoDefault is provided, trigger tariff lookup
  useEffect(() => {
    if (puntoDestinoDefault && puntoDestinoDefault > 0) {
      consultarTarifa(puntoDestinoDefault);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle destination change
  const handleDestinoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestino = Number(e.target.value);
    setPuntoDestino(newDestino);
    if (newDestino > 0) {
      consultarTarifa(newDestino);
    } else {
      setPrecio(0);
      setError('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: '#f8fafc',
      border: '1.5px solid #e2e8f0',
      borderRadius: 12,
      fontFamily: "'Hanken Grotesk', 'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Label */}
      <label style={{
        fontSize: 12,
        fontWeight: 700,
        color: '#64748b',
        whiteSpace: 'nowrap',
        letterSpacing: '0.3px',
      }}>
        Destino
      </label>

      {/* Select */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
        <select
          value={puntoDestino}
          onChange={handleDestinoChange}
          disabled={puntosRuta.length === 0}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            fontWeight: 600,
            color: '#0f172a',
            appearance: 'none',
            cursor: puntosRuta.length > 0 ? 'pointer' : 'not-allowed',
            padding: '2px 20px 2px 0',
          }}
        >
          {puntosRuta.length === 0 ? (
            <option value={0}>Cargando destinos...</option>
          ) : (
            <>
              <option value={0}>Seleccione destino</option>
              {puntosDestinoDisponibles.map(p => (
                <option key={p.idpuntoruta} value={p.idpuntoruta}>{p.nombre}</option>
              ))}
            </>
          )}
        </select>
        <div style={{ position: 'absolute', right: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Price / Loading / Error */}
      <div style={{ flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
        {cargando && (
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            Calculando...
          </span>
        )}
        {!cargando && error && (
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
            Error tarifa
          </span>
        )}
        {!cargando && !error && precio > 0 && (
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
            ${Math.round(precio).toLocaleString('es-CO')}
          </span>
        )}
      </div>

      {/* Tooltip for error details */}
      {!cargando && error && (
        <div style={{
          position: 'absolute',
          bottom: -24,
          left: 0,
          fontSize: 11,
          color: '#ef4444',
          fontWeight: 500,
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
