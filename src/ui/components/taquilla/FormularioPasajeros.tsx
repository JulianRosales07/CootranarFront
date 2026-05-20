import React, { useState, useEffect } from 'react';

const BLUE = '#1a56db';

interface Pasajero {
  idusuario?: number;
  tipodocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  genero?: 'M' | 'F';
  correo?: string;
  telefono?: string;
}

interface AsientoConPasajero {
  idasientoviaje: number;
  numero: number;
  espoltrona: boolean;
  pasajero?: Pasajero;
  puntoOrigen?: { idpuntoruta: number; nombre?: string };
  puntoDestino?: { idpuntoruta: number; nombre?: string };
  precio?: number;
}

interface FormularioPasajerosProps {
  asientos: AsientoConPasajero[];
  viaje?: any;
  onBuscarPasajero: (documento: string) => Promise<Pasajero | null>;
  onAsignarPasajero: (idAsiento: number, pasajero: Pasajero) => void;
  onContinuar: () => void;
  onVolver: () => void;
  cargando?: boolean;
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 13,
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
};

function formatHora(h: string) {
  if (!h) return '—';
  const [hh, mm] = String(h).split(':').map(Number);
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${hh>=12?'PM':'AM'}`;
}

export const FormularioPasajeros: React.FC<FormularioPasajerosProps> = ({
  asientos,
  viaje,
  onBuscarPasajero,
  onAsignarPasajero,
  onContinuar,
  onVolver,
  cargando = false,
}) => {
  const [asientoActual, setAsientoActual] = useState(0);
  const [buscando, setBuscando] = useState(false);
  const [ultimoDocBuscado, setUltimoDocBuscado] = useState<string>(() => {
    return asientos[0]?.pasajero?.documento || '';
  });
  const [formData, setFormData] = useState<Pasajero>(() => {
    const first = asientos[0]?.pasajero;
    if (first) return { ...first };
    return {
      tipodocumento: 'CC',
      documento: '',
      nombre: '',
      apellido: '',
      genero: undefined,
      correo: '',
      telefono: '',
    };
  });

  const asientoSel = asientos[asientoActual];
  const todosAsignados = asientos.every(a => a.pasajero);
  const completados = asientos.filter(a => a.pasajero).length;

  // Debounced autocomplete effect when typing document number
  useEffect(() => {
    const doc = formData.documento.trim();
    if (doc.length < 7) {
      return;
    }
    // If it's already the last successfully searched document, skip search
    if (doc === ultimoDocBuscado) {
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const p = await onBuscarPasajero(doc);
        if (p) {
          setFormData(prev => ({
            ...p,
            tipodocumento: p.tipodocumento || prev.tipodocumento
          }));
        }
        setUltimoDocBuscado(doc);
      } catch (e) {
        console.error('Error al autocompletar pasajero:', e);
      } finally {
        setBuscando(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.documento, ultimoDocBuscado, onBuscarPasajero]);

  const handleBuscar = async () => {
    const doc = formData.documento.trim();
    if (!doc) return;
    setBuscando(true);
    try {
      const p = await onBuscarPasajero(doc);
      if (p) {
        setFormData({ ...p, tipodocumento: p.tipodocumento || 'CC' });
      } else {
        setFormData(prev => ({
          tipodocumento: prev.tipodocumento,
          documento: prev.documento,
          nombre: '',
          apellido: '',
          genero: undefined,
          correo: '',
          telefono: '',
        }));
      }
      setUltimoDocBuscado(doc);
    } catch (e) {
      console.error(e);
    } finally {
      setBuscando(false);
    }
  };

  const handleAsignar = () => {
    if (!formData.nombre || !formData.apellido || !formData.documento) return;
    onAsignarPasajero(asientoSel.idasientoviaje, formData);
    
    // Clean form and set next seat
    if (asientoActual < asientos.length - 1) {
      const nextIdx = asientoActual + 1;
      setAsientoActual(nextIdx);
      const nextAsiento = asientos[nextIdx];
      if (nextAsiento.pasajero) {
        setFormData({ ...nextAsiento.pasajero });
        setUltimoDocBuscado(nextAsiento.pasajero.documento || '');
      } else {
        setFormData({ tipodocumento: 'CC', documento: '', nombre: '', apellido: '', genero: undefined, correo: '', telefono: '' });
        setUltimoDocBuscado('');
      }
    } else {
      setFormData({ tipodocumento: 'CC', documento: '', nombre: '', apellido: '', genero: undefined, correo: '', telefono: '' });
      setUltimoDocBuscado('');
    }
  };

  const handleCambiarAsiento = (i: number) => {
    setAsientoActual(i);
    const a = asientos[i];
    if (a.pasajero) {
      setFormData({ ...a.pasajero });
      setUltimoDocBuscado(a.pasajero.documento || '');
    } else {
      setFormData({ tipodocumento: 'CC', documento: '', nombre: '', apellido: '', genero: undefined, correo: '', telefono: '' });
      setUltimoDocBuscado('');
    }
  };

  const canConfirm = !!(formData.nombre && formData.apellido && formData.documento);

  // Progress bar for top stepper
  const progPct = asientos.length > 0 ? (completados / asientos.length) * 100 : 0;

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f3f4f6', minHeight: '100vh' }}>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, padding: 20, alignItems: 'start', maxWidth: 960, margin: '0 auto' }}>

        {/* ══════════ LEFT: Stepper + Accordion-style forms ══════════ */}
        <div>
          {/* Step Header */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: BLUE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>1</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Datos de Pasajeros</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#6b7280' }}>Ingresa la información de los viajeros (Pasajero {asientoActual + 1} de {asientos.length})</p>
              {/* Progress bar */}
              <div style={{ height: 5, background: '#e5e7eb', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progPct}%`, background: BLUE, borderRadius: 100, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>

          {/* Accordion: one card per asiento */}
          {asientos.map((asiento, idx) => {
            const isActive = idx === asientoActual;
            const isDone = !!asiento.pasajero && !isActive;
            return (
              <div key={asiento.idasientoviaje} style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${isActive ? BLUE : '#e5e7eb'}`, marginBottom: 10, overflow: 'hidden' }}>
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => handleCambiarAsiento(idx)}
                  style={{ width: '100%', padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: isDone ? '#22c55e' : isActive ? BLUE : '#9ca3af' }}>
                      {isDone ? 'check_circle' : 'person'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      Pasajero Adulto {idx + 1}
                    </span>
                    {asiento.pasajero && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        — {asiento.pasajero.nombre} {asiento.pasajero.apellido}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!asiento.pasajero && (
                      <span style={{ fontSize: 11, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Obligatorio</span>
                    )}
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9ca3af' }}>
                      {isActive ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>

                {/* Accordion Body — only shown when active */}
                {isActive && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

                      {/* Documento de Identidad */}
                      <div>
                        <label style={lbl}>Documento de Identidad <span style={{ color: '#ef4444' }}>*</span></label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <select
                            value={formData.tipodocumento}
                            onChange={e => setFormData(p => ({ ...p, tipodocumento: e.target.value }))}
                            style={{ ...inp, width: 110, flexShrink: 0 }}
                          >
                            <option value="CC">C.C.</option>
                            <option value="CE">C.E.</option>
                            <option value="TI">T.I.</option>
                            <option value="PA">Pasaporte</option>
                          </select>
                          <input
                            type="text"
                            value={formData.documento}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(p => ({
                                ...p,
                                documento: val,
                                nombre: '',
                                apellido: '',
                                genero: undefined,
                                correo: '',
                                telefono: ''
                              }));
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                            placeholder="Número de documento"
                            style={{ ...inp, flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={handleBuscar}
                            disabled={buscando || !formData.documento}
                            style={{
                              flexShrink: 0, padding: '9px 16px', background: BLUE, border: 'none', borderRadius: 8,
                              color: '#fff', fontSize: 13, fontWeight: 700, cursor: buscando || !formData.documento ? 'not-allowed' : 'pointer',
                              opacity: buscando || !formData.documento ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 5,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{buscando ? 'progress_activity' : 'search'}</span>
                            Consultar
                          </button>
                        </div>
                      </div>

                      {/* Nombres + Género */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={lbl}>Nombres <span style={{ color: '#ef4444' }}>*</span></label>
                          <input type="text" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Juan Andrés" style={inp} />
                        </div>
                        <div>
                          <label style={lbl}>Género</label>
                          <div style={{ display: 'flex', gap: 16, paddingTop: 10 }}>
                            {(['M','F'] as const).map(g => (
                              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                <input type="radio" name={`genero-${idx}`} value={g} checked={formData.genero === g} onChange={() => setFormData(p => ({ ...p, genero: g }))} style={{ accentColor: BLUE }} />
                                {g === 'M' ? 'Masculino' : 'Femenino'}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Apellidos */}
                      <div>
                        <label style={lbl}>Apellidos <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" value={formData.apellido} onChange={e => setFormData(p => ({ ...p, apellido: e.target.value }))} placeholder="Ej: Pérez Gomez" style={inp} />
                      </div>

                      {/* Correo + Teléfono */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={lbl}>Correo Electrónico</label>
                          <input type="email" value={formData.correo || ''} onChange={e => setFormData(p => ({ ...p, correo: e.target.value }))} placeholder="ejemplo@correo.com" style={inp} />
                        </div>
                        <div>
                          <label style={lbl}>Teléfono de Contacto</label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ ...inp, width: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>+57</div>
                            <input type="tel" value={formData.telefono || ''} onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))} placeholder="300 123 4567" style={{ ...inp, flex: 1 }} />
                          </div>
                        </div>
                      </div>

                      {/* Confirm button */}
                      <button
                        type="button"
                        onClick={handleAsignar}
                        disabled={!canConfirm}
                        style={{
                          width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                          background: canConfirm ? '#22c55e' : '#d1d5db', color: '#fff',
                          fontSize: 14, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
                          cursor: canConfirm ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: canConfirm ? '0 4px 14px rgba(34,197,94,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                        Confirmar Datos del Asiento
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={onVolver}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Regresar a Selección de Asientos
            </button>
            <button
              type="button"
              onClick={onContinuar}
              disabled={!todosAsignados || cargando}
              style={{
                padding: '11px 24px', borderRadius: 10, border: 'none',
                background: todosAsignados && !cargando ? BLUE : '#93c5fd',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: todosAsignados && !cargando ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: todosAsignados && !cargando ? '0 4px 14px rgba(26,86,219,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {cargando ? 'Procesando...' : 'Siguiente: Resumen de Pago'}
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        </div>

        {/* ══════════ RIGHT: Resumen del Viaje sidebar ══════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Resumen del Viaje</p>
            </div>
            <div style={{ padding: '16px' }}>
              {/* Origen */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: BLUE, border: `2px solid ${BLUE}` }} />
                  <div style={{ width: 1.5, height: 40, background: '#e5e7eb', margin: '3px 0' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316', border: '2px solid #f97316' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 0.5 }}>Origen</p>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{asientos[0]?.puntoOrigen?.nombre || viaje?.ciudadorigen || 'Cargando...'}</p>
                  <p style={{ margin: '0 0 18px', fontSize: 11, color: '#6b7280' }}>{formatHora(viaje?.horasalida || '')}</p>
                  <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: 0.5 }}>Destino</p>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{asientos[0]?.puntoDestino?.nombre || viaje?.nombreciudaddestino || 'Cargando...'}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}></p>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Fecha</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {viaje?.fechasalida ? new Date(viaje.fechasalida).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Cargando...'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Vehículo</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {viaje?.nombretipobus || 'Bus'} {viaje?.numeromovil ? `#${viaje.numeromovil}` : ''}
                  </p>
                </div>
              </div>

              {/* Asientos pills */}
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Asientos</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {asientos.map(a => (
                    <span key={a.idasientoviaje} style={{ padding: '3px 10px', background: BLUE, color: '#fff', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{a.numero}</span>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ marginTop: 14, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Pasaje x{asientos.length}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    ${(asientos.reduce((sum, a) => sum + Number(a.precio || 50000), 0)).toLocaleString('es-CO')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total a Pagar</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: BLUE }}>
                    ${(asientos.reduce((sum, a) => sum + Number(a.precio || 50000), 0)).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timer warning */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#d97706', flexShrink: 0 }}>schedule</span>
            <p style={{ margin: 0, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
              Su reserva se mantendrá por <strong>15 minutos</strong> para completar el pago.
            </p>
          </div>

          {/* Bus image card */}
          <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 100, background: '#1e3a5f' }}>
            <img
              alt="Bus"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6OmHPgg6GWC-UoWyVQY5YbX0qf7RebYsnuw6FxEOB3bKohJeaU9qc8s6e-aJBThjAQ6Nc_EjLzfuYHJXxWsX-PGW_bYR_1Sj45aBqQEF9a7r6ilT-sf5vpmtJ5B47oZs2EuGG1SPl2cFUykbMICQEt3ERn8nKPuEmj36pq-wU1DDYdNY4sICQ0P8SxSU78gISuf1cVrB2kMlop-Pq8z2q_Ju4rkNvHKcbaxJ07hNRRVFGs2WFnVCYgGr7WfWvTLkSuLh0Qt-ZesgC"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,58,95,0.9) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#fff' }}>Experiencia Gacela Premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};