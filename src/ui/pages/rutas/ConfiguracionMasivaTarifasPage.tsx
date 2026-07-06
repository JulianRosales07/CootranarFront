import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { rutasApi } from '../../../infrastructure/services/rutasApi';
import { tarifasMasivasApi } from '../../../infrastructure/services/tarifasMasivasApi';

const BLUE = '#0D3B8E';

const claveCombo = (c: any) => `${c.idPuntoOrigen}-${c.idPuntoDestino}-${c.idTipoBus}-${c.piso}`;

const inputStyle: React.CSSProperties = {
  width: '100px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px',
  fontSize: '13px', fontFamily: 'monospace', outline: 'none', textAlign: 'right',
};

export const ConfiguracionMasivaTarifasPage = () => {
  const { idruta } = useParams<{ idruta: string }>();
  const navigate = useNavigate();

  const [combinaciones, setCombinaciones] = useState<any[]>([]);
  const [valoresEditados, setValoresEditados] = useState<Map<string, any>>(new Map());
  const [filtros, setFiltros] = useState({ terminalOrigen: '', tipoBus: '' });
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [completitud, setCompletitud] = useState<any>(null);

  // Ruta info
  const { data: ruta } = useQuery({
    queryKey: ['ruta', idruta],
    queryFn: async () => {
      const res = await rutasApi.obtenerPorId(idruta!);
      return res.data.data?.ruta || res.data.ruta;
    },
    enabled: !!idruta,
  });

  useQuery({
    queryKey: ['puntos-ruta', idruta],
    queryFn: async () => {
      const res = await rutasApi.obtenerPuntos(idruta!);
      return res.data.data?.puntos || res.data.puntos || [];
    },
    enabled: !!idruta,
  });

  useEffect(() => { if (idruta) cargarTodo(); }, [idruta]);

  const cargarTodo = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([cargarCombinaciones(), cargarCompletitud()]);
    } catch { setError('Error al cargar datos.'); }
    finally { setLoading(false); }
  };

  const cargarCombinaciones = useCallback(async () => {
    const res = await tarifasMasivasApi.obtenerCombinaciones(idruta!);
    const data = res.data.data || res.data;
    const combos = data.combinaciones || [];
    setCombinaciones(combos);
    const mapa = new Map<string, any>();
    combos.forEach((c: any) => {
      if (c.yaConfigurada) {
        mapa.set(claveCombo(c), {
          valorNormal: c.valorNormal ?? '',
          valorTraficoAlto: c.valorTraficoAlto ?? '',
          adicionalPoltrona: c.adicionalPoltrona ?? 0,
        });
      }
    });
    setValoresEditados(mapa);
  }, [idruta]);

  const cargarCompletitud = useCallback(async () => {
    const res = await tarifasMasivasApi.obtenerCompletitud(idruta!);
    setCompletitud(res.data.data || res.data);
  }, [idruta]);

  // Filtros
  const terminalesOrigen = useMemo(() => {
    const vistos = new Set<number>();
    return combinaciones.filter(c => { if (vistos.has(c.idPuntoOrigen)) return false; vistos.add(c.idPuntoOrigen); return true; })
      .map(c => ({ id: c.idPuntoOrigen, nombre: c.nombreOrigen }));
  }, [combinaciones]);

  const tiposBus = useMemo(() => {
    const vistos = new Set<number>();
    return combinaciones.filter(c => { if (vistos.has(c.idTipoBus)) return false; vistos.add(c.idTipoBus); return true; })
      .map(c => ({ id: c.idTipoBus, nombre: c.nombreTipoBus }));
  }, [combinaciones]);

  const combinacionesFiltradas = useMemo(() => {
    return combinaciones.filter(c => {
      if (filtros.terminalOrigen && c.idPuntoOrigen !== parseInt(filtros.terminalOrigen)) return false;
      if (filtros.tipoBus && c.idTipoBus !== parseInt(filtros.tipoBus)) return false;
      return true;
    });
  }, [combinaciones, filtros]);

  const handleCampoChange = (combo: any, campo: string, valor: string) => {
    const clave = claveCombo(combo);
    setValoresEditados(prev => {
      const next = new Map(prev);
      const actual = next.get(clave) ?? { valorNormal: combo.valorNormal ?? '', valorTraficoAlto: combo.valorTraficoAlto ?? '', adicionalPoltrona: combo.adicionalPoltrona ?? 0 };
      next.set(clave, { ...actual, [campo]: valor });
      return next;
    });
  };

  const handleGuardar = async () => {
    const tarifasAGuardar: any[] = [];
    combinaciones.forEach(c => {
      const vals = valoresEditados.get(claveCombo(c));
      if (!vals) return;
      const vn = parseFloat(vals.valorNormal);
      const vta = parseFloat(vals.valorTraficoAlto);
      if (!vn || !vta) return;
      tarifasAGuardar.push({
        idRuta: c.idRuta, idPuntoOrigen: c.idPuntoOrigen, idPuntoDestino: c.idPuntoDestino,
        idTipoBus: c.idTipoBus, piso: c.piso, valorNormal: vn, valorTraficoAlto: vta,
        adicionalPoltrona: parseFloat(vals.adicionalPoltrona) || 0, idTarifaTramo: c.idTarifaTramo ?? null,
      });
    });
    if (tarifasAGuardar.length === 0) { setError('No hay tarifas con valores completos para guardar.'); return; }

    setGuardando(true); setError(null); setMensajeExito(null);
    try {
      const res = await tarifasMasivasApi.guardarTarifasMasivas(tarifasAGuardar);
      const d = res.data.data || res.data;
      setMensajeExito(`${d.totalProcesadas} tarifa(s) guardadas (${d.tarifasCreadas} creadas, ${d.tarifasActualizadas} actualizadas).`);
      await cargarCombinaciones();
      await cargarCompletitud();
    } catch (e: any) { setError(e.response?.data?.message || 'Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const pct = completitud?.porcentaje ?? 0;

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Configuración masiva — {ruta?.nombre || '...'}
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
            Configura todas las tarifas de la ruta en una sola operación
          </p>
        </div>
        <button onClick={() => navigate(`/rutas/${idruta}/tarifas`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span> Volver a Tarifas
        </button>
      </div>

      {/* Completitud */}
      {completitud && (
        <div style={{ background: 'white', border: '1px solid #e8edf2', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Completitud de tarifas</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{completitud.totalConfiguradas} / {completitud.totalRequeridas}</span>
          </div>
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', background: pct === 100 ? '#16a34a' : '#f59e0b', width: `${Math.min(pct, 100)}%`, transition: 'width 0.3s' }} />
          </div>
          <p style={{ fontSize: '11px', color: pct === 100 ? '#16a34a' : '#d97706', marginTop: '6px' }}>
            {pct === 100 ? '✓ Todas las tarifas configuradas.' : `⚠ Faltan ${completitud.totalRequeridas - completitud.totalConfiguradas} por configurar.`}
          </p>
        </div>
      )}

      {/* Mensajes */}
      {mensajeExito && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span> {mensajeExito}
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span> {error}
        </div>
      )}

      {/* Filtros */}
      {combinaciones.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <select value={filtros.terminalOrigen} onChange={e => setFiltros(f => ({ ...f, terminalOrigen: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', minWidth: '180px', outline: 'none', fontFamily: 'inherit' }}>
            <option value="">Todos los orígenes</option>
            {terminalesOrigen.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <select value={filtros.tipoBus} onChange={e => setFiltros(f => ({ ...f, tipoBus: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', minWidth: '180px', outline: 'none', fontFamily: 'inherit' }}>
            <option value="">Todos los tipos de bus</option>
            {tiposBus.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>{combinacionesFiltradas.length} de {combinaciones.length} combinaciones</span>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Cargando combinaciones...</div>
      ) : combinaciones.length === 0 ? (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#92400e' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>warning</span>
          <p style={{ fontWeight: 600 }}>Sin combinaciones disponibles</p>
          <p style={{ fontSize: '13px' }}>Esta ruta no tiene terminales configurados o no hay tipos de bus activos.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Origen</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Destino</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tipo Bus</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Piso</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Valor Normal</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tráfico Alto</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>+ Poltrona</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {combinacionesFiltradas.map(c => {
                  const clave = claveCombo(c);
                  const vals = valoresEditados.get(clave) ?? { valorNormal: c.valorNormal ?? '', valorTraficoAlto: c.valorTraficoAlto ?? '', adicionalPoltrona: c.adicionalPoltrona ?? 0 };
                  return (
                    <tr key={clave} style={{ borderBottom: '1px solid #f1f5f9', background: c.yaConfigurada ? '#f0fdf410' : 'white' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{c.nombreOrigen}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{c.nombreDestino}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{c.nombreTipoBus}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11px', fontWeight: 700 }}>{c.piso}</span>
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        <input type="number" min="1" value={vals.valorNormal} onChange={e => handleCampoChange(c, 'valorNormal', e.target.value)} placeholder="65000" style={inputStyle} />
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        <input type="number" min="1" value={vals.valorTraficoAlto} onChange={e => handleCampoChange(c, 'valorTraficoAlto', e.target.value)} placeholder="80000" style={inputStyle} />
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        <input type="number" min="0" value={vals.adicionalPoltrona} onChange={e => handleCampoChange(c, 'adicionalPoltrona', e.target.value)} placeholder="0" style={{ ...inputStyle, width: '80px' }} />
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        {c.yaConfigurada ? (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>✓ OK</span>
                        ) : (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', color: '#94a3b8' }}>Pendiente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Acciones */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Deja vacíos los campos que no deseas configurar ahora.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => navigate(`/rutas/${idruta}/tarifas`)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', background: BLUE, color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: guardando ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                {guardando ? 'Guardando...' : 'Guardar todas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
