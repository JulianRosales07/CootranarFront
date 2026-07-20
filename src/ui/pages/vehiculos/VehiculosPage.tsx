  import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useVehiculos } from '../../hooks/useVehiculos';
import { vehiculosApi as vehiculosService } from '../../../infrastructure/services/vehiculosApi';
import ModalDetalleVehiculo from '../../components/vehiculos/ModalDetalleVehiculo';
import FormularioVehiculoMultiPaso from '../../components/vehiculos/FormularioVehiculoMultiPaso';

const BLUE = '#0D3B8E';

/* ─── Pagination helpers ──────────────────────────────────── */
function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      minWidth: '30px', height: '30px', padding: '0 6px',
      border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
      borderRadius: '6px', background: active ? BLUE : 'white',
      color: active ? 'white' : '#475569',
      fontSize: '13px', fontWeight: active ? 700 : 400,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    }}>{label}</button>
  );
}
function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '30px', height: '30px',
      border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? '#cbd5e1' : '#475569', transition: 'all 0.15s',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </button>
  );
}

/* ─── Field helper ────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px',
  fontSize: '13px', color: '#334155', outline: 'none',
  background: 'white', fontFamily: 'inherit',
};

/* ═══════════════════════════════════════════════════════════ */
export const VehiculosPage = () => {
  const { remove, activar } = useVehiculos();

  /* ── navigation state ────────────────────────────────────── */
  const [vistaActual, setVistaActual] = useState<'formulario' | 'lista'>('lista');
  const [mostrarFormularioMultiPaso, setMostrarFormularioMultiPaso] = useState(false);
  const [vehiculoIdEdicion, setVehiculoIdEdicion] = useState<string | null>(null);

  /* ── API state for lista view ────────────────────────────── */
  const [vehiculosApi, setVehiculosApi] = useState<any[]>([]);
  const [paginacionApi, setPaginacionApi] = useState<any>(null);
  const [paginaActualApi, setPaginaActualApi] = useState(1);
  const [filtroApi, setFiltroApi] = useState('todos');
  const [busquedaApi, setBusquedaApi] = useState('');
  const [cargandoApi, setCargandoApi] = useState(false);
  const [vehiculoDetalle, setVehiculoDetalle] = useState<any>(null);

  /* ── API functions for lista view ────────────────────────── */
  const cargarVehiculosApi = useCallback(async () => {
    setCargandoApi(true);
    try {
      const params = { page: paginaActualApi, limit: 10 };
      let res;
      if (busquedaApi.trim()) {
        res = await vehiculosService.buscar(busquedaApi.trim(), params);
      } else if (filtroApi === 'activos') {
        res = await vehiculosService.obtenerActivos(params);
      } else if (filtroApi === 'inactivos') {
        res = await vehiculosService.obtenerInactivos(params);
      } else {
        res = await vehiculosService.obtenerTodos(params);
      }
      setVehiculosApi(res.data.data.vehiculos || []);
      setPaginacionApi(res.data.data.paginacion || null);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
      setVehiculosApi([]);
    } finally {
      setCargandoApi(false);
    }
  }, [paginaActualApi, filtroApi, busquedaApi]);

  const handleFiltroApi = (nuevoFiltro: string) => {
    setFiltroApi(nuevoFiltro);
    setPaginaActualApi(1);
  };

  const handleBusquedaApi = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaApi(e.target.value);
    setPaginaActualApi(1);
  };

  useEffect(() => {
    if (vistaActual === 'lista') {
      cargarVehiculosApi();
    }
  }, [vistaActual, cargarVehiculosApi]);

  const handleDesactivarVehiculo = (v: { idvehiculo: string | number; placa?: string }) => {
    const placa = v.placa ?? 'este vehículo';
    if (!window.confirm(`¿Está seguro de desactivar el vehículo ${placa}? Esta acción se puede revertir activando el vehículo nuevamente.`)) return;
    remove.mutate(String(v.idvehiculo), {
      onSuccess: () => {
        cargarVehiculosApi();
        setVehiculoDetalle((d: any) => (d && String(d.idvehiculo) === String(v.idvehiculo) ? null : d));
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ?? err?.message ?? 'No se pudo desactivar el vehículo.';
        window.alert(msg);
      },
    });
  };

  const handleActivarVehiculo = (v: { idvehiculo: string | number; placa?: string }) => {
    const placa = v.placa ?? 'este vehículo';
    if (!window.confirm(`¿Está seguro de activar el vehículo ${placa}?`)) return;
    activar.mutate(String(v.idvehiculo), {
      onSuccess: () => {
        cargarVehiculosApi();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ?? err?.message ?? 'No se pudo activar el vehículo.';
        window.alert(msg);
      },
    });
  };

  return (
    <Layout>
      {/* Mostrar formulario multi-paso si está activo */}
      {mostrarFormularioMultiPaso ? (
        <FormularioVehiculoMultiPaso
          vehiculoId={vehiculoIdEdicion}
          onVehiculoCreado={() => {
            setMostrarFormularioMultiPaso(false);
            setVehiculoIdEdicion(null);
            cargarVehiculosApi();
          }}
          onCancelar={() => {
            setMostrarFormularioMultiPaso(false);
            setVehiculoIdEdicion(null);
          }}
        />
      ) : (
        <>
      {/* ── Navigation Tabs ─────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e8edf2',
        padding: '0 24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setVistaActual('lista')}
            style={{
              padding: '14px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: vistaActual === 'lista' ? `3px solid ${BLUE}` : '3px solid transparent',
              color: vistaActual === 'lista' ? BLUE : '#64748b',
              fontSize: '14px',
              fontWeight: vistaActual === 'lista' ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>list</span>
            Lista de Vehículos
          </button>
        </div>
      </div>

      {vistaActual === 'formulario' ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <p>Use el botón "Nuevo Vehículo" para crear un vehículo.</p>
        </div>
      ) : (
        /* ── Lista de Vehículos View ────────────────────────── */
        <>
          {/* Header with search and filters */}
          <div style={{
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e8edf2',
            padding: '20px 24px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Vehículos Registrados
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '320px' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}>search</span>
                  <input
                    value={busquedaApi}
                    onChange={handleBusquedaApi}
                    placeholder="Buscar vehículo..."
                    style={{
                      ...inputStyle,
                      paddingLeft: '40px',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <button
                  onClick={() => setMostrarFormularioMultiPaso(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: BLUE,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
                  onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                  Nuevo Vehículo
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['todos', 'activos', 'inactivos'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFiltroApi(f)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: `1px solid ${filtroApi === f ? BLUE : '#e2e8f0'}`,
                    background: filtroApi === f ? BLUE : 'white',
                    color: filtroApi === f ? 'white' : '#64748b',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

      {/* ── Tabla de Vehículos ────────────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {cargandoApi ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando vehículos...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'TipoVehiculo',        width: '90px'  },
                    { label: 'Placa',       width: '110px' },
                    { label: 'Nº Móvil',    width: '100px' },
                    { label: 'Tipo Bus',    width: '140px' },
                    { label: 'Capacidad',   width: '90px'  },
                    { label: 'Estado',      width: '120px' },
                    { label: 'Acciones',    width: '150px'  },
                  ].map(({ label, width }) => (
                    <th key={label} style={{
                      width, padding: '11px 16px',
                      textAlign: 'left', fontSize: '10.5px', fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '1px solid #e8edf2', background: '#f8fafc',
                    }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehiculosApi.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No se encontraron vehículos.
                    </td>
                  </tr>
                ) : (
                  vehiculosApi.map((v: any) => (
                    <tr key={v.idvehiculo} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: 700,
                          background: v.tipovehiculo === 'FURGON' ? '#fef3c7' : '#dbeafe',
                          color: v.tipovehiculo === 'FURGON' ? '#92400e' : '#1e40af',
                        }}>
                          {v.tipovehiculo === 'FURGON' ? 'FURGÓN' : 'BUS'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{v.placa}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{v.numeromovil}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{v.tipovehiculo === 'FURGON' ? '—' : (v.nombretipobus || '—')}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{v.tipovehiculo === 'FURGON' ? '—' : v.capacidad}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: v.activo ? '#dcfce7' : '#fee2e2',
                          color: v.activo ? '#15803d' : '#dc2626',
                          fontSize: '11.5px',
                          fontWeight: 700,
                        }}>
                          {v.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            title="Ver Detalle"
                            onClick={() => setVehiculoDetalle(v)}
                            style={{
                              background: 'none', border: 'none', padding: 0,
                              cursor: 'pointer', color: '#94a3b8',
                              display: 'flex', alignItems: 'center', transition: 'color 0.15s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                          <button
                            title="Editar"
                            onClick={() => {
                              setVehiculoIdEdicion(v.idvehiculo);
                              setMostrarFormularioMultiPaso(true);
                            }}
                            style={{
                              background: 'none', border: 'none', padding: 0,
                              cursor: 'pointer', color: '#94a3b8',
                              display: 'flex', alignItems: 'center', transition: 'color 0.15s'
                            }}
                            onMouseEnter={(e: any) => (e.currentTarget.style.color = BLUE)}
                            onMouseLeave={(e: any) => (e.currentTarget.style.color = '#94a3b8')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                           {v.activo ? (
                            <button
                              title="Desactivar"
                              type="button"
                              disabled={remove.isPending}
                              onClick={() => handleDesactivarVehiculo(v)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: remove.isPending ? 'default' : 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                                opacity: remove.isPending ? 0.5 : 1,
                              }}
                              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                if (!remove.isPending) e.currentTarget.style.color = '#dc2626';
                              }}
                              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.color = '#94a3b8';
                              }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>block</span>
                            </button>
                          ) : (
                            <button
                              title="Activar"
                              type="button"
                              disabled={activar.isPending}
                              onClick={() => handleActivarVehiculo(v)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: activar.isPending ? 'default' : 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                                opacity: activar.isPending ? 0.5 : 1,
                              }}
                              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                if (!activar.isPending) e.currentTarget.style.color = '#16a34a';
                              }}
                              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.color = '#94a3b8';
                              }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {paginacionApi && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 20px',
                borderTop: '1px solid #f1f5f9',
              }}>
                <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                  Mostrando{' '}
                  <strong style={{ color: '#475569' }}>{((Number(paginacionApi.paginaActual || 1) - 1) * Number(paginacionApi.limite || 10)) + 1}</strong>{' '}
                  a{' '}
                  <strong style={{ color: '#475569' }}>
                    {Math.min(Number(paginacionApi.paginaActual || 1) * Number(paginacionApi.limite || 10), Number(paginacionApi.totalRegistros || 0))}
                  </strong>{' '}
                  de{' '}
                  <strong style={{ color: '#475569' }}>{paginacionApi.totalRegistros || 0}</strong>{' '}
                  vehículos
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <NavArrow
                    icon="chevron_left"
                    disabled={paginaActualApi === 1}
                    onClick={() => setPaginaActualApi(p => p - 1)}
                  />
                  {Array.from({ length: paginacionApi.totalPaginas }, (_, i) => i + 1)
                    .filter(p => {
                      if (paginacionApi.totalPaginas <= 5) return true;
                      if (p === 1 || p === paginacionApi.totalPaginas) return true;
                      if (Math.abs(p - paginaActualApi) <= 1) return true;
                      return false;
                    })
                    .map((p, i, arr) => {
                      const prev = arr[i - 1];
                      const showDots = prev && p - prev > 1;
                      return (
                        <React.Fragment key={p}>
                          {showDots && <span style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>...</span>}
                          <PagBtn
                            label={String(p)}
                            active={p === paginaActualApi}
                            onClick={() => setPaginaActualApi(p)}
                          />
                        </React.Fragment>
                      );
                    })}
                  <NavArrow
                    icon="chevron_right"
                    disabled={paginaActualApi === paginacionApi.totalPaginas}
                    onClick={() => setPaginaActualApi(p => p + 1)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )}

  <ModalDetalleVehiculo
    vehiculo={vehiculoDetalle}
    onCerrar={() => setVehiculoDetalle(null)}
  />
</>
)}
</Layout>
  );
};

