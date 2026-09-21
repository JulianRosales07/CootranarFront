import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { rutasApi } from '../../../infrastructure/services/rutasApi';
import configuracionMillasApi, {
  type ConfiguracionMillasCompleta,
  type NivelMillas, type NivelMillasInput,
  type RecompensaMillas, type RecompensaMillasInput,
  type PromocionMillas, type PromocionMillasInput,
  type ReglasMillasInput,
} from '../../../infrastructure/services/configuracionMillasApi';
import {
  Campo, Interruptor,
  ModalNivel, ModalRecompensa, ModalPromocion,
} from '../../components/millas/ModalesConfiguracionMillas';
import {
  C, FONT, TH, TD, inputStyle, labelStyle,
  botonPrimario, botonSecundario, botonPeligro, botonIcono,
} from '../../components/millas/estilosMillas';

type Pestania = 'reglas' | 'niveles' | 'recompensas' | 'promociones';

const PESTANIAS: Array<{ id: Pestania; label: string; icono: string; descripcion: string }> = [
  { id: 'reglas', label: 'Reglas', icono: 'tune', descripcion: 'Cómo se acumulan y cuánto valen las millas' },
  { id: 'niveles', label: 'Niveles', icono: 'military_tech', descripcion: 'Rangos, multiplicadores y beneficios del club' },
  { id: 'recompensas', label: 'Recompensas', icono: 'redeem', descripcion: 'Catálogo que el cliente puede canjear' },
  { id: 'promociones', label: 'Promociones', icono: 'campaign', descripcion: 'Campañas temporales de millas extra' },
];

const fmtMoneda = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

const fmtFecha = (f?: string | null) => {
  if (!f) return '—';
  return new Date(String(f).split('T')[0] + 'T12:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const ETIQUETA_TIPO: Record<string, string> = {
  MULTIPLICADOR: 'Multiplicador',
  PORCENTAJE_EXTRA: '% extra',
  MILLAS_EXTRA: 'Millas fijas',
};

const describirBeneficio = (p: PromocionMillas) => {
  if (p.tipo === 'MULTIPLICADOR') return `x${Number(p.valor)}`;
  if (p.tipo === 'PORCENTAJE_EXTRA') return `+${Number(p.valor)}%`;
  return `+${Number(p.valor)} millas`;
};

const mensajeError = (err: unknown, porDefecto: string) => {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message || porDefecto;
};

// ── Tarjeta contenedora ──────────────────────────────────────────────────────
const Tarjeta = ({ titulo, descripcion, accion, children }: {
  titulo: string; descripcion?: string; accion?: React.ReactNode; children: React.ReactNode;
}) => (
  <div style={{
    background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`,
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,53,95,0.06)',
  }}>
    <div style={{
      padding: '15px 18px', borderBottom: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
    }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: C.onSurface, fontFamily: FONT }}>{titulo}</h3>
        {descripcion && (
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.onSurfaceVariant, fontFamily: FONT }}>{descripcion}</p>
        )}
      </div>
      {accion}
    </div>
    {children}
  </div>
);

const Vacio = ({ texto, icono }: { texto: string; icono: string }) => (
  <div style={{ padding: '48px 24px', textAlign: 'center', color: C.onSurfaceVariant, fontFamily: FONT }}>
    <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>
      {icono}
    </span>
    <p style={{ margin: 0, fontSize: '13.5px' }}>{texto}</p>
  </div>
);

const Badge = ({ texto, tono }: { texto: string; tono: 'ok' | 'warn' | 'off' }) => {
  const paleta = {
    ok: { bg: C.successBg, fg: C.success },
    warn: { bg: C.warningBg, fg: C.warning },
    off: { bg: C.surfaceContainerLow, fg: C.onSurfaceVariant },
  }[tono];
  return (
    <span style={{
      padding: '3px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT,
      background: paleta.bg, color: paleta.fg, whiteSpace: 'nowrap',
    }}>{texto}</span>
  );
};

// ── Página ───────────────────────────────────────────────────────────────────
export const ConfiguracionMillasPage = () => {
  const [pestania, setPestania] = useState<Pestania>('reglas');
  const [datos, setDatos] = useState<ConfiguracionMillasCompleta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [rutas, setRutas] = useState<Array<{ idruta: number; nombre: string }>>([]);

  // Formulario de reglas
  const [reglas, setReglas] = useState<ReglasMillasInput | null>(null);
  const [guardandoReglas, setGuardandoReglas] = useState(false);

  // Modales
  const [modalNivel, setModalNivel] = useState<{ nivel: NivelMillas | null } | null>(null);
  const [modalRecompensa, setModalRecompensa] = useState<{ recompensa: RecompensaMillas | null } | null>(null);
  const [modalPromocion, setModalPromocion] = useState<{ promocion: PromocionMillas | null } | null>(null);
  const [guardandoModal, setGuardandoModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const avisar = useCallback((tipo: 'ok' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 6000);
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await configuracionMillasApi.obtenerTodo();
      const data = res.data?.data as ConfiguracionMillasCompleta;
      setDatos(data);
      const c = data.configuracion;
      setReglas({
        programaActivo: c.programaactivo,
        nombrePrograma: c.nombreprograma,
        subtitulo: c.subtitulo,
        pesosPorMilla: Number(c.pesospormilla),
        valorMillaCop: Number(c.valormillacop),
        bonoBienvenida: Number(c.bonobienvenida),
        montosRapidos: Array.isArray(c.montosrapidos) ? c.montosrapidos.map(Number) : [],
        acumulaTaquilla: c.acumulataquilla,
        acumulaEcommerce: c.acumulaecommerce,
        aplicarMultiplicadorNivel: c.aplicarmultiplicadornivel,
      });
    } catch (err) {
      setErrorCarga(mensajeError(err, 'No se pudo cargar la configuración del programa de millas.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    rutasApi.obtenerActivas()
      .then(res => {
        const lista = res.data?.data?.rutas || res.data?.data || [];
        setRutas(
          (Array.isArray(lista) ? lista : [])
            .map((r: Record<string, unknown>) => ({
              idruta: Number(r.idruta ?? r.id),
              nombre: String(r.nombre ?? `Ruta ${r.idruta ?? r.id}`),
            }))
            .filter(r => Number.isFinite(r.idruta))
        );
      })
      .catch(() => setRutas([]));
  }, []);

  // ── Guardar reglas ─────────────────────────────────────────────────────────
  const guardarReglas = async () => {
    if (!reglas) return;
    if (!reglas.nombrePrograma.trim() || !reglas.subtitulo.trim()) {
      avisar('error', 'El nombre y el subtítulo del programa son obligatorios.');
      return;
    }
    if (reglas.montosRapidos.length === 0) {
      avisar('error', 'Define al menos un monto rápido para la calculadora.');
      return;
    }
    setGuardandoReglas(true);
    try {
      await configuracionMillasApi.actualizarReglas(reglas);
      avisar('ok', 'Reglas del programa actualizadas. Los saldos de los clientes se recalculan al instante.');
      await cargar();
    } catch (err) {
      avisar('error', mensajeError(err, 'No se pudieron guardar las reglas.'));
    } finally {
      setGuardandoReglas(false);
    }
  };

  // ── Acciones de niveles ────────────────────────────────────────────────────
  const guardarNivel = async (payload: NivelMillasInput & { orden?: number }) => {
    setGuardandoModal(true);
    setErrorModal(null);
    try {
      if (modalNivel?.nivel) {
        await configuracionMillasApi.actualizarNivel(modalNivel.nivel.idnivel, payload);
        avisar('ok', `Nivel "${payload.nombre}" actualizado.`);
      } else {
        await configuracionMillasApi.crearNivel(payload);
        avisar('ok', `Nivel "${payload.nombre}" creado.`);
      }
      setModalNivel(null);
      await cargar();
    } catch (err) {
      setErrorModal(mensajeError(err, 'No se pudo guardar el nivel.'));
    } finally {
      setGuardandoModal(false);
    }
  };

  const eliminarNivel = async (nivel: NivelMillas) => {
    if (!window.confirm(`¿Eliminar el nivel "${nivel.nombre}"? Los clientes en ese rango pasarán al nivel que lo cubra.`)) return;
    try {
      await configuracionMillasApi.eliminarNivel(nivel.idnivel);
      avisar('ok', `Nivel "${nivel.nombre}" eliminado.`);
      await cargar();
    } catch (err) {
      avisar('error', mensajeError(err, 'No se pudo eliminar el nivel.'));
    }
  };

  // ── Acciones de recompensas ────────────────────────────────────────────────
  const guardarRecompensa = async (payload: RecompensaMillasInput & { orden?: number }) => {
    setGuardandoModal(true);
    setErrorModal(null);
    try {
      if (modalRecompensa?.recompensa) {
        await configuracionMillasApi.actualizarRecompensa(modalRecompensa.recompensa.idrecompensa, payload);
        avisar('ok', `Recompensa "${payload.titulo}" actualizada.`);
      } else {
        await configuracionMillasApi.crearRecompensa(payload);
        avisar('ok', `Recompensa "${payload.titulo}" creada.`);
      }
      setModalRecompensa(null);
      await cargar();
    } catch (err) {
      setErrorModal(mensajeError(err, 'No se pudo guardar la recompensa.'));
    } finally {
      setGuardandoModal(false);
    }
  };

  const eliminarRecompensa = async (recompensa: RecompensaMillas) => {
    if (!window.confirm(`¿Eliminar la recompensa "${recompensa.titulo}" del catálogo?`)) return;
    try {
      await configuracionMillasApi.eliminarRecompensa(recompensa.idrecompensa);
      avisar('ok', `Recompensa "${recompensa.titulo}" eliminada.`);
      await cargar();
    } catch (err) {
      avisar('error', mensajeError(err, 'No se pudo eliminar la recompensa.'));
    }
  };

  // ── Acciones de promociones ────────────────────────────────────────────────
  const guardarPromocion = async (payload: PromocionMillasInput) => {
    setGuardandoModal(true);
    setErrorModal(null);
    try {
      if (modalPromocion?.promocion) {
        await configuracionMillasApi.actualizarPromocion(modalPromocion.promocion.idpromocion, payload);
        avisar('ok', `Promoción "${payload.nombre}" actualizada.`);
      } else {
        await configuracionMillasApi.crearPromocion(payload);
        avisar('ok', `Promoción "${payload.nombre}" creada.`);
      }
      setModalPromocion(null);
      await cargar();
    } catch (err) {
      setErrorModal(mensajeError(err, 'No se pudo guardar la promoción.'));
    } finally {
      setGuardandoModal(false);
    }
  };

  const eliminarPromocion = async (promocion: PromocionMillas) => {
    if (!window.confirm(`¿Eliminar la promoción "${promocion.nombre}"? Las millas que otorgó dejarán de contarse.`)) return;
    try {
      await configuracionMillasApi.eliminarPromocion(promocion.idpromocion);
      avisar('ok', `Promoción "${promocion.nombre}" eliminada.`);
      await cargar();
    } catch (err) {
      avisar('error', mensajeError(err, 'No se pudo eliminar la promoción.'));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const pestaniaActual = PESTANIAS.find(p => p.id === pestania)!;

  return (
    <Layout>
      <div style={{ marginBottom: '16px', fontFamily: FONT }}>
        <p style={{ fontSize: '13.5px', color: C.onSurfaceVariant, margin: 0, fontWeight: 500 }}>
          Configura el programa de millas que ven los clientes en la plataforma: reglas de acumulación,
          niveles del club, catálogo de recompensas y promociones temporales.
        </p>
      </div>

      {mensaje && (
        <div style={{
          padding: '12px 18px', borderRadius: '10px', marginBottom: '16px',
          background: mensaje.tipo === 'ok' ? C.successBg : C.errorBg,
          border: `1px solid ${mensaje.tipo === 'ok' ? '#86efac' : '#fca5a5'}`,
          color: mensaje.tipo === 'ok' ? C.success : C.error,
          fontWeight: 700, fontSize: '14px', fontFamily: FONT,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {mensaje.tipo === 'ok' ? 'check_circle' : 'error'}
          </span>
          {mensaje.texto}
        </div>
      )}

      {/* Pestañas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {PESTANIAS.map(p => {
          const activa = p.id === pestania;
          return (
            <button
              key={p.id}
              onClick={() => setPestania(p.id)}
              aria-pressed={activa}
              style={{
                padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: FONT,
                fontSize: '13.5px', fontWeight: activa ? 800 : 600,
                background: activa ? C.primary : '#fff',
                color: activa ? '#fff' : C.onSurfaceVariant,
                border: activa ? 'none' : `1px solid ${C.outlineVariant}`,
                display: 'inline-flex', alignItems: 'center', gap: '7px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{p.icono}</span>
              {p.label}
            </button>
          );
        })}
      </div>

      {cargando && (
        <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.outlineVariant}`, padding: '64px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '38px', color: C.secondary, display: 'block', marginBottom: '12px' }}>progress_activity</span>
          <p style={{ color: C.onSurfaceVariant, fontFamily: FONT, fontWeight: 600, margin: 0 }}>Cargando configuración…</p>
        </div>
      )}

      {!cargando && errorCarga && (
        <div style={{ background: C.errorBg, border: '1px solid #fca5a5', borderRadius: '14px', padding: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: C.error, flexShrink: 0 }}>error</span>
          <div style={{ fontFamily: FONT }}>
            <p style={{ fontWeight: 700, color: C.error, margin: '0 0 4px' }}>No se pudo cargar</p>
            <p style={{ color: C.error, margin: '0 0 10px', fontSize: '13px' }}>{errorCarga}</p>
            <button onClick={cargar} style={botonSecundario}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!cargando && !errorCarga && datos && reglas && (
        <>
          {/* ── REGLAS ── */}
          {pestania === 'reglas' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <Tarjeta titulo="Identidad del programa" descripcion={pestaniaActual.descripcion}>
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'grid', gap: '13px', marginBottom: '13px' }}>
                    <Campo label="Nombre del programa *" id="cfg-nombre">
                      <input id="cfg-nombre" value={reglas.nombrePrograma} maxLength={120}
                        onChange={e => setReglas({ ...reglas, nombrePrograma: e.target.value })} style={inputStyle} />
                    </Campo>
                    <Campo label="Subtítulo *" id="cfg-subtitulo" ayuda="Se muestra bajo el título en la página del cliente">
                      <textarea id="cfg-subtitulo" value={reglas.subtitulo} rows={2} maxLength={300}
                        onChange={e => setReglas({ ...reglas, subtitulo: e.target.value })}
                        style={{ ...inputStyle, resize: 'vertical' }} />
                    </Campo>
                  </div>
                  <Interruptor
                    id="cfg-activo"
                    label="Programa activo"
                    ayuda="Si lo desactivas, la página del cliente lo informa y deja de promocionarse"
                    valor={reglas.programaActivo}
                    onChange={v => setReglas({ ...reglas, programaActivo: v })}
                  />
                </div>
              </Tarjeta>

              <Tarjeta titulo="Acumulación y valor de las millas">
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '13px', marginBottom: '16px' }}>
                    <Campo label="Pesos por milla *" id="cfg-pesos" ayuda={`Hoy: $${reglas.pesosPorMilla} = 1 milla`}>
                      <input id="cfg-pesos" type="number" min={1} value={reglas.pesosPorMilla}
                        onChange={e => setReglas({ ...reglas, pesosPorMilla: Number(e.target.value) })} style={inputStyle} />
                    </Campo>
                    <Campo label="Valor de 1 milla (COP) *" id="cfg-valor" ayuda="Cuánto descuenta cada milla al redimir">
                      <input id="cfg-valor" type="number" min={0} value={reglas.valorMillaCop}
                        onChange={e => setReglas({ ...reglas, valorMillaCop: Number(e.target.value) })} style={inputStyle} />
                    </Campo>
                    <Campo label="Bono de bienvenida *" id="cfg-bono" ayuda="Millas que recibe todo cliente registrado">
                      <input id="cfg-bono" type="number" min={0} value={reglas.bonoBienvenida}
                        onChange={e => setReglas({ ...reglas, bonoBienvenida: Number(e.target.value) })} style={inputStyle} />
                    </Campo>
                  </div>

                  <div style={{
                    background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`,
                    borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                    fontSize: '12.5px', color: C.onSurfaceVariant, fontFamily: FONT,
                    display: 'flex', gap: '9px', alignItems: 'flex-start',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.secondary, flexShrink: 0 }}>calculate</span>
                    <span>
                      Con estas reglas, un pasaje de {fmtMoneda(60000)} otorga{' '}
                      <strong>{Math.floor(60000 / Math.max(reglas.pesosPorMilla, 1))} millas</strong>, equivalentes a{' '}
                      <strong>{fmtMoneda(Math.floor(60000 / Math.max(reglas.pesosPorMilla, 1)) * reglas.valorMillaCop)}</strong> de descuento.
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    <Interruptor id="cfg-taq" label="Acumular en ventas de taquilla"
                      valor={reglas.acumulaTaquilla} onChange={v => setReglas({ ...reglas, acumulaTaquilla: v })} />
                    <Interruptor id="cfg-eco" label="Acumular en ventas de e-commerce"
                      valor={reglas.acumulaEcommerce} onChange={v => setReglas({ ...reglas, acumulaEcommerce: v })} />
                    <Interruptor id="cfg-mult" label="Aplicar el multiplicador del nivel"
                      ayuda="Si lo activas, los clientes de niveles altos acumulan más y sus saldos suben. Apagado, el multiplicador es solo informativo."
                      valor={reglas.aplicarMultiplicadorNivel} onChange={v => setReglas({ ...reglas, aplicarMultiplicadorNivel: v })} />
                  </div>
                </div>
              </Tarjeta>

              <Tarjeta titulo="Calculadora de la página del cliente" descripcion="Montos sugeridos que aparecen como botones rápidos">
                <div style={{ padding: '18px' }}>
                  <label style={labelStyle}>Montos rápidos (máximo 6)</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {reglas.montosRapidos.map((monto, i) => (
                      <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <input
                          type="number" min={1} value={monto}
                          aria-label={`Monto rápido ${i + 1}`}
                          onChange={e => setReglas({
                            ...reglas,
                            montosRapidos: reglas.montosRapidos.map((m, idx) => (idx === i ? Number(e.target.value) : m)),
                          })}
                          style={{ ...inputStyle, width: '130px' }}
                        />
                        <button
                          onClick={() => setReglas({ ...reglas, montosRapidos: reglas.montosRapidos.filter((_, idx) => idx !== i) })}
                          title="Quitar monto"
                          aria-label={`Quitar monto rápido ${i + 1}`}
                          style={{ ...botonPeligro, padding: '8px 9px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                        </button>
                      </div>
                    ))}
                    {reglas.montosRapidos.length < 6 && (
                      <button
                        onClick={() => setReglas({ ...reglas, montosRapidos: [...reglas.montosRapidos, 50000] })}
                        style={{ ...botonSecundario, padding: '9px 13px', fontSize: '12.5px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        Agregar monto
                      </button>
                    )}
                  </div>
                </div>
              </Tarjeta>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={cargar} style={botonSecundario}>
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>undo</span>
                  Descartar cambios
                </button>
                <button onClick={guardarReglas} disabled={guardandoReglas} style={botonPrimario(guardandoReglas)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {guardandoReglas ? 'progress_activity' : 'save'}
                  </span>
                  {guardandoReglas ? 'Guardando…' : 'Guardar reglas'}
                </button>
              </div>
            </div>
          )}

          {/* ── NIVELES ── */}
          {pestania === 'niveles' && (
            <Tarjeta
              titulo={`${datos.niveles.length} ${datos.niveles.length === 1 ? 'nivel' : 'niveles'} configurados`}
              descripcion={pestaniaActual.descripcion}
              accion={
                <button onClick={() => { setErrorModal(null); setModalNivel({ nivel: null }); }} style={botonPrimario()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Nuevo nivel
                </button>
              }
            >
              {datos.niveles.length === 0 ? (
                <Vacio icono="military_tech" texto="Aún no hay niveles. Crea al menos uno para que el club funcione." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Nivel', 'Rango de millas', 'Multiplicador', 'Descuento', 'Beneficios', 'Estado', ''].map(h => (
                          <th key={h} style={{ ...TH, textAlign: h === '' ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.niveles.map(n => (
                        <tr key={n.idnivel}>
                          <td style={TD}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <span style={{ width: '13px', height: '13px', borderRadius: '4px', background: n.color, display: 'inline-block', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 800 }}>{n.nombre}</div>
                                <div style={{ fontSize: '11px', color: C.onSurfaceVariant }}>{n.codigo}</div>
                              </div>
                            </div>
                          </td>
                          <td style={TD}>
                            {Number(n.minmillas).toLocaleString('es-CO')} – {n.maxmillas == null ? 'sin tope' : Number(n.maxmillas).toLocaleString('es-CO')}
                          </td>
                          <td style={{ ...TD, fontWeight: 700 }}>x{Number(n.multiplicador)}</td>
                          <td style={TD}>{n.descuentotiquetes}</td>
                          <td style={TD}>{n.beneficios?.length ?? 0}</td>
                          <td style={TD}><Badge texto={n.activo ? 'Activo' : 'Inactivo'} tono={n.activo ? 'ok' : 'off'} /></td>
                          <td style={{ ...TD, textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => { setErrorModal(null); setModalNivel({ nivel: n }); }} style={botonIcono}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                                Editar
                              </button>
                              <button onClick={() => eliminarNivel(n)} style={botonPeligro}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tarjeta>
          )}

          {/* ── RECOMPENSAS ── */}
          {pestania === 'recompensas' && (
            <Tarjeta
              titulo={`${datos.recompensas.length} recompensas en el catálogo`}
              descripcion={pestaniaActual.descripcion}
              accion={
                <button onClick={() => { setErrorModal(null); setModalRecompensa({ recompensa: null }); }} style={botonPrimario()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Nueva recompensa
                </button>
              }
            >
              {datos.recompensas.length === 0 ? (
                <Vacio icono="redeem" texto="El catálogo está vacío. Crea recompensas para que los clientes canjeen sus millas." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Recompensa', 'Costo', 'Valor equivalente', 'Categoría', 'Estado', ''].map(h => (
                          <th key={h} style={{ ...TH, textAlign: h === '' ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.recompensas.map(r => (
                        <tr key={r.idrecompensa}>
                          <td style={TD}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.secondary }}>{r.icono}</span>
                              <div>
                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}>
                                  {r.titulo}
                                  {r.destacado && <Badge texto="Popular" tono="warn" />}
                                </div>
                                {r.descripcion && (
                                  <div style={{ fontSize: '11.5px', color: C.onSurfaceVariant, maxWidth: '380px' }}>{r.descripcion}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ ...TD, fontWeight: 800, color: C.primary }}>
                            {Number(r.millasrequeridas).toLocaleString('es-CO')} pts
                          </td>
                          <td style={TD}>{fmtMoneda(Number(r.valordescuentocop))}</td>
                          <td style={TD}>{r.categoria}</td>
                          <td style={TD}><Badge texto={r.activo ? 'Visible' : 'Oculta'} tono={r.activo ? 'ok' : 'off'} /></td>
                          <td style={{ ...TD, textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => { setErrorModal(null); setModalRecompensa({ recompensa: r }); }} style={botonIcono}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                                Editar
                              </button>
                              <button onClick={() => eliminarRecompensa(r)} style={botonPeligro}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tarjeta>
          )}

          {/* ── PROMOCIONES ── */}
          {pestania === 'promociones' && (
            <Tarjeta
              titulo={`${datos.promociones.length} ${datos.promociones.length === 1 ? 'promoción' : 'promociones'}`}
              descripcion={pestaniaActual.descripcion}
              accion={
                <button onClick={() => { setErrorModal(null); setModalPromocion({ promocion: null }); }} style={botonPrimario()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Crear promoción
                </button>
              }
            >
              {datos.promociones.length === 0 ? (
                <Vacio icono="campaign" texto="No hay promociones. Crea una campaña para otorgar millas extra en un periodo." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Campaña', 'Beneficio', 'Vigencia', 'Aplica en', 'Condiciones', 'Estado', ''].map(h => (
                          <th key={h} style={{ ...TH, textAlign: h === '' ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.promociones.map(p => (
                        <tr key={p.idpromocion}>
                          <td style={TD}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: p.color }}>{p.icono}</span>
                              <div>
                                <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                                {p.descripcion && (
                                  <div style={{ fontSize: '11.5px', color: C.onSurfaceVariant, maxWidth: '300px' }}>{p.descripcion}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={TD}>
                            <div style={{ fontWeight: 800, color: C.primary }}>{describirBeneficio(p)}</div>
                            <div style={{ fontSize: '11px', color: C.onSurfaceVariant }}>{ETIQUETA_TIPO[p.tipo]}</div>
                          </td>
                          <td style={TD}>
                            {fmtFecha(p.fechainicio)}<br />
                            <span style={{ color: C.onSurfaceVariant, fontSize: '11.5px' }}>al {fmtFecha(p.fechafin)}</span>
                          </td>
                          <td style={TD}>
                            {p.origenaplicable === 'AMBOS' ? 'Todos los canales' : p.origenaplicable}
                            <div style={{ fontSize: '11.5px', color: C.onSurfaceVariant }}>
                              {p.nombreruta ?? 'Todas las rutas'}
                            </div>
                          </td>
                          <td style={TD}>
                            <div style={{ fontSize: '11.5px', color: C.onSurfaceVariant }}>
                              {Number(p.montominimo) > 0 ? `Mínimo ${fmtMoneda(Number(p.montominimo))}` : 'Sin mínimo'}
                              <br />
                              {p.topemillas != null ? `Tope ${Number(p.topemillas).toLocaleString('es-CO')} millas` : 'Sin tope'}
                            </div>
                          </td>
                          <td style={TD}>
                            {!p.activo
                              ? <Badge texto="Inactiva" tono="off" />
                              : p.vigente
                                ? <Badge texto="Vigente" tono="ok" />
                                : <Badge texto="Fuera de fecha" tono="warn" />}
                          </td>
                          <td style={{ ...TD, textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => { setErrorModal(null); setModalPromocion({ promocion: p }); }} style={botonIcono}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                                Editar
                              </button>
                              <button onClick={() => eliminarPromocion(p)} style={botonPeligro}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tarjeta>
          )}
        </>
      )}

      {/* Modales */}
      {modalNivel && (
        <ModalNivel
          nivel={modalNivel.nivel}
          onClose={() => setModalNivel(null)}
          onGuardar={guardarNivel}
          guardando={guardandoModal}
          error={errorModal}
        />
      )}
      {modalRecompensa && (
        <ModalRecompensa
          recompensa={modalRecompensa.recompensa}
          onClose={() => setModalRecompensa(null)}
          onGuardar={guardarRecompensa}
          guardando={guardandoModal}
          error={errorModal}
        />
      )}
      {modalPromocion && (
        <ModalPromocion
          promocion={modalPromocion.promocion}
          rutas={rutas}
          onClose={() => setModalPromocion(null)}
          onGuardar={guardarPromocion}
          guardando={guardandoModal}
          error={errorModal}
        />
      )}
    </Layout>
  );
};

export default ConfiguracionMillasPage;
