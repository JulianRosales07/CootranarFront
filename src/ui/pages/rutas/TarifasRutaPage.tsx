import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rutasApi } from '../../../infrastructure/services/rutasApi';
import { tarifasRutaApi } from '../../../infrastructure/services/tarifasRutaApi';
import { BarraCompletitud } from '../../components/rutas/BarraCompletitud';
import { ModalTarifa } from '../../components/rutas/ModalTarifa';
import { useCompletitudTarifas } from '../../hooks/useCompletitudTarifas';

const BLUE = '#0D3B8E';

const fmtPeso = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

interface PuntoRuta {
  idpuntoruta: number;
  nombre: string;
  idagencia: number | null;
  orden: number;
  tiempodesdeanteriorth: number;
  tiempodesdeanteriorm: number;
}

interface TipoBus {
  idtipobus: number;
  nombre: string;
  cantidadpisos: number;
}

interface Tarifa {
  idtarifatramo: number;
  idpuntoorigen: number;
  idpuntodestino: number;
  idtipobus: number;
  piso: number;
  valornormal: number;
  valortraficoalto: number;
  adicionalpoltrona: number;
  nombreorigenpunto: string;
  nombredestinopunto: string;
  nombretipobus: string;
}

export const TarifasRutaPage = () => {
  const { idruta } = useParams<{ idruta: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filtroTipoBus, setFiltroTipoBus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoData, setEditandoData] = useState<any>(null);

  // Queries
  const { data: ruta, isLoading: loadingRuta } = useQuery({
    queryKey: ['ruta', idruta],
    queryFn: async () => {
      const response = await rutasApi.obtenerPorId(idruta!);
      return response.data.data.ruta;
    },
    enabled: !!idruta,
  });

  const { data: puntos = [], isLoading: loadingPuntos } = useQuery({
    queryKey: ['puntos-ruta', idruta],
    queryFn: async () => {
      const response = await rutasApi.obtenerPuntos(idruta!);
      return response.data.data.puntos || [];
    },
    enabled: !!idruta,
  });

  const { data: tiposBus = [], isLoading: loadingTiposBus } = useQuery({
    queryKey: ['tipos-bus-activos'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tipoBus/activos`, {
        credentials: 'include',
      });
      const data = await response.json();
      return data.data.tiposbus || [];
    },
  });

  const { data: tarifas = [], isLoading: loadingTarifas, refetch: refetchTarifas } = useQuery({
    queryKey: ['tarifas-ruta', idruta, filtroTipoBus],
    queryFn: async () => {
      const params = filtroTipoBus ? { idtipobus: filtroTipoBus } : {};
      const response = await tarifasRutaApi.obtenerPorRuta(idruta!, params);
      return response.data.data.tarifas || [];
    },
    enabled: !!idruta,
  });

  const { completitud, isLoading: loadingCompletitud } = useCompletitudTarifas(idruta || null);

  // Mutations
  const crearMutation = useMutation({
    mutationFn: (data: any) => tarifasRutaApi.crear({ ...data, idruta: parseInt(idruta!) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] });
      queryClient.invalidateQueries({ queryKey: ['completitud-tarifas'] });
      setModalOpen(false);
      setEditandoId(null);
      setEditandoData(null);
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      tarifasRutaApi.actualizar(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] });
      queryClient.invalidateQueries({ queryKey: ['completitud-tarifas'] });
      setModalOpen(false);
      setEditandoId(null);
      setEditandoData(null);
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => tarifasRutaApi.eliminar(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] });
      queryClient.invalidateQueries({ queryKey: ['completitud-tarifas'] });
    },
  });

  const handleAbrirAgregar = () => {
    setEditandoId(null);
    setEditandoData(null);
    setModalOpen(true);
  };

  const handleAbrirEditar = (tarifa: Tarifa) => {
    setEditandoId(tarifa.idtarifatramo);
    setEditandoData(tarifa);
    setModalOpen(true);
  };

  const handleGuardarTarifa = async (data: any) => {
    try {
      if (editandoId) {
        await actualizarMutation.mutateAsync({ id: editandoId, data });
      } else {
        await crearMutation.mutateAsync(data);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la tarifa');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta tarifa?')) return;
    try {
      await eliminarMutation.mutateAsync(id);
    } catch {
      alert('Error al eliminar tarifa');
    }
  };

  const loading = loadingRuta || loadingPuntos || loadingTiposBus || loadingTarifas;

  if (!ruta && !loadingRuta) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>Ruta no encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Tarifas — {ruta?.nombre || 'Cargando...'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '2px', gap: '4px' }}>
            <span>Inicio</span>
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chevron_right</span>
            <span style={{ cursor: 'pointer', color: BLUE }} onClick={() => navigate('/rutas')}>Rutas</span>
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chevron_right</span>
            <span style={{ color: BLUE, fontWeight: 600 }}>Tarifas</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/rutas')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Volver
        </button>
      </header>

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Info ruta */}
        {ruta && (
          <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{ruta.nombre}</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                <span>{ruta.tiporuta === 'INTERMUNICIPAL' ? 'Intermunicipal' : 'Municipal'}</span>
                {ruta.via && <span>· {ruta.via}</span>}
                {(ruta.duracionh || ruta.duracionm) && (
                  <span>· {ruta.duracionh ? `${ruta.duracionh}h ` : ''}{ruta.duracionm ? `${ruta.duracionm}min` : ''}</span>
                )}
                {ruta.distanciakm && <span>· {ruta.distanciakm} km</span>}
              </div>
            </div>

            {/* Mini recorrido */}
            {puntos.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                {puntos.map((p: PuntoRuta, i: number) => {
                  const isFirst = i === 0;
                  const isLast = i === puntos.length - 1;
                  const bg = isFirst ? '#f0fdf4' : isLast ? '#f1f5f9' : p.idagencia ? '#f0fdf4' : 'white';
                  const border = isFirst ? '1px solid #bbf7d0' : isLast ? '1px solid #e2e8f0' : p.idagencia ? '1px solid #bbf7d0' : '1px dashed #e2e8f0';

                  return (
                    <React.Fragment key={p.idpuntoruta}>
                      {i > 0 && <div style={{ width: '16px', height: '2px', background: '#d1d5db' }} />}
                      <div style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: bg, border }}>
                        {p.nombre}
                        {p.idagencia && i !== 0 && i !== puntos.length - 1 && <span style={{ marginLeft: '2px', color: '#22c55e' }}>★</span>}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Barra de completitud */}
        {completitud && !loadingCompletitud && (
          <BarraCompletitud
            requeridas={completitud.requeridas}
            configuradas={completitud.configuradas}
            porcentaje={completitud.porcentaje}
          />
        )}

        {/* Encabezado tabla + filtros */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Tarifas configuradas</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={filtroTipoBus}
              onChange={(e) => setFiltroTipoBus(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', minWidth: '200px', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="">Todos los tipos de bus</option>
              {tiposBus.map((tb: TipoBus) => (
                <option key={tb.idtipobus} value={tb.idtipobus}>{tb.nombre}</option>
              ))}
            </select>
            <button
              onClick={handleAbrirAgregar}
              style={{ background: BLUE, color: 'white', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Agregar tarifa
            </button>
          </div>
        </div>

        {/* Tabla */}
        <section style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  <th style={{ padding: '16px 20px' }}>Origen tramo</th>
                  <th style={{ padding: '16px 20px' }}>Destino tramo</th>
                  <th style={{ padding: '16px 20px' }}>Tipo bus</th>
                  <th style={{ padding: '16px 20px' }}>Piso</th>
                  <th style={{ padding: '16px 20px' }}>Valor normal</th>
                  <th style={{ padding: '16px 20px' }}>Tráfico alto</th>
                  <th style={{ padding: '16px 20px' }}>+ Poltrona</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #f1f5f9' }}>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      Cargando...
                    </td>
                  </tr>
                ) : tarifas.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>payments</span>
                        <p style={{ fontWeight: 600, color: '#94a3b8', margin: 0 }}>Sin tarifas configuradas</p>
                        <p style={{ fontSize: '12px', margin: 0 }}>Agrega la primera tarifa para esta ruta.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tarifas.map((t: Tarifa) => (
                    <tr key={t.idtarifatramo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1e293b' }}>{t.nombreorigenpunto}</td>
                      <td style={{ padding: '12px 20px', color: '#64748b' }}>{t.nombredestinopunto}</td>
                      <td style={{ padding: '12px 20px', color: '#64748b' }}>{t.nombretipobus}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {t.piso}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#1e293b' }}>{fmtPeso(t.valornormal)}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#1e293b' }}>{fmtPeso(t.valortraficoalto)}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#94a3b8' }}>
                        {parseFloat(String(t.adicionalpoltrona)) > 0 ? fmtPeso(t.adicionalpoltrona) : '—'}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleAbrirEditar(t)}
                            style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', background: '#dbeafe', color: '#1e40af', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', fontWeight: 600 }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(t.idtarifatramo)}
                            style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', fontWeight: 600 }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {tarifas.length > 0 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: '#eff6ff', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '18px' }}>info</span>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
                El sistema usa <strong>Valor normal</strong> o <strong>Tráfico alto</strong> según el estado global configurado en el sistema.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      <ModalTarifa
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditandoId(null);
          setEditandoData(null);
        }}
        onSave={handleGuardarTarifa}
        puntos={puntos}
        tiposBus={tiposBus}
        editando={editandoData}
        loading={crearMutation.isPending || actualizarMutation.isPending}
      />
    </Layout>
  );
};
