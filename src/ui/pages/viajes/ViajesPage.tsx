import React, { useState, useCallback } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useViajes } from '../../hooks/useViajes';
import { viajesApi } from '../../../infrastructure/services/viajesApi';
import { ModalSeleccionarRuta } from '../../components/viajes/ModalSeleccionarRuta';
import { ModalDetallesViaje } from '../../components/viajes/ModalDetallesViaje';

const BLUE = '#0D3B8E';

interface FormData {
  idruta: string;
  nombreruta: string;
  idvehiculo: string;
  numeromovil: string;
  placa: string;
  fechasalida: string;
  horasalida: string;
}

interface DatosVehiculo {
  idvehiculo: number;
  placa: string;
  numeromovil: string;
  nombretipobus: string;
  capacidad: number;
  cantidadpisos: number;
  conductores: any[];
}

const BadgeEstado: React.FC<{ estado: string }> = ({ estado }) => {
  const estados: Record<string, { bg: string; color: string; texto: string }> = {
    'PROGRAMADO': { bg: '#dbeafe', color: '#1e40af', texto: 'PROGRAMADO' },
    'EN_CAMINO': { bg: '#dcfce7', color: '#166534', texto: 'EN CAMINO' },
    'FINALIZADO': { bg: '#f1f5f9', color: '#475569', texto: 'FINALIZADO' },
    'CANCELADO': { bg: '#fee2e2', color: '#dc2626', texto: 'CANCELADO' }
  };
  
  const config = estados[estado] || { bg: '#f1f5f9', color: '#475569', texto: estado || '—' };
  
  return (
    <span style={{ 
      display: 'inline-block', 
      padding: '3px 12px', 
      borderRadius: '20px', 
      background: config.bg, 
      color: config.color, 
      fontSize: '11.5px', 
      fontWeight: 700 
    }}>
      {config.texto}
    </span>
  );
};

const formatearFecha = (fechasalida: string) => {
  if (!fechasalida) return '—';
  const str = String(fechasalida);
  const dateObj = str.length === 10
    ? (() => { const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); })()
    : new Date(str);
  return dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatearHora = (horasalida: string) => {
  if (!horasalida) return '—';
  const [hh, mm] = String(horasalida).split(':').map(Number);
  const periodo = hh >= 12 ? 'p.m.' : 'a.m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${periodo}`;
};

export const ViajesPage = () => {
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [viajeDetalles, setViajeDetalles] = useState<any>(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  // Form state
  const [mostrarModalRuta, setMostrarModalRuta] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idruta: '',
    nombreruta: '',
    idvehiculo: '',
    numeromovil: '',
    placa: '',
    fechasalida: '',
    horasalida: ''
  });
  const [datosVehiculo, setDatosVehiculo] = useState<DatosVehiculo | null>(null);
  const [cargandoVehiculo, setCargandoVehiculo] = useState(false);
  const [conductoresVehiculo, setConductoresVehiculo] = useState<any[]>([]);

  const { viajes, paginacion, isLoading, refetch, crear, activar, desactivar } = useViajes(filtro, paginaActual, busqueda);

  const handleSeleccionarRuta = (ruta: any) => {
    setFormData(prev => ({
      ...prev,
      idruta: String(ruta.idruta),
      nombreruta: `${ruta.ciudadorigen} - ${ruta.ciudaddestino}`
    }));
    setMostrarModalRuta(false);
  };

  const handleNumeroMovilBlur = async () => {
    if (!formData.numeromovil || formData.numeromovil.trim() === '') {
      setDatosVehiculo(null);
      setConductoresVehiculo([]);
      setFormData(prev => ({ ...prev, placa: '' }));
      return;
    }

    setCargandoVehiculo(true);
    try {
      const res = await viajesApi.obtenerDatosVehiculo(formData.numeromovil);
      const vehiculo = res.data.data.vehiculo;
      setDatosVehiculo(vehiculo);
      setConductoresVehiculo(vehiculo.conductores || []);
      setFormData(prev => ({
        ...prev,
        idvehiculo: String(vehiculo.idvehiculo),
        placa: vehiculo.placa
      }));
    } catch (err: any) {
      console.error('Error cargando vehículo:', err);
      alert(err.response?.data?.message || 'Vehículo no encontrado');
      setDatosVehiculo(null);
      setConductoresVehiculo([]);
      setFormData(prev => ({ ...prev, placa: '' }));
    } finally {
      setCargandoVehiculo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idruta || !formData.idvehiculo || !formData.fechasalida || !formData.horasalida) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      await crear.mutateAsync({
        idruta: parseInt(formData.idruta),
        idvehiculo: parseInt(formData.idvehiculo),
        fechasalida: formData.fechasalida,
        horasalida: formData.horasalida
      });

      alert('Viaje programado correctamente');
      setFormData({
        idruta: '',
        nombreruta: '',
        idvehiculo: '',
        numeromovil: '',
        placa: '',
        fechasalida: '',
        horasalida: ''
      });
      setDatosVehiculo(null);
      setConductoresVehiculo([]);
    } catch (err: any) {
      console.error('Error creando viaje:', err);
      alert(err.response?.data?.message || 'Error al programar viaje');
    }
  };

  const handleVerDetalles = async (viaje: any) => {
    setCargandoDetalles(true);
    try {
      const res = await viajesApi.obtenerPorId(viaje.idviaje);
      setViajeDetalles(res.data.data.viaje);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      alert('Error al cargar detalles del viaje');
    } finally {
      setCargandoDetalles(false);
    }
  };

  const handleToggle = async (viaje: any) => {
    try {
      if (viaje.activo) {
        await desactivar.mutateAsync(viaje.idviaje);
      } else {
        await activar.mutateAsync(viaje.idviaje);
      }
    } catch (err: any) {
      console.error('Error toggle:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '7px',
    fontSize: '13px',
    color: '#334155',
    outline: 'none',
    background: 'white',
    fontFamily: 'inherit',
  };

  return (
    <Layout>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Gestión de Viajes
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '2px', gap: '4px' }}>
            <span>Inicio</span>
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chevron_right</span>
            <span>Operaciones</span>
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chevron_right</span>
            <span style={{ color: BLUE, fontWeight: 600 }}>Viajes</span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>search</span>
          </span>
          <input 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '288px', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#f8fafc', color: '#475569', outline: 'none', fontFamily: 'inherit' }}
            placeholder="Buscar viaje..." 
            type="text" 
          />
        </div>
      </header>

      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Formulario para programar viaje */}
        <section style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px', marginBottom: '16px' }}>Programar Nuevo Viaje</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Selección de ruta */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Ruta <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={formData.nombreruta}
                    readOnly
                    placeholder="Seleccione una ruta"
                    style={{ ...inputStyle, flex: 1, background: '#f8fafc' }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarModalRuta(true)}
                    style={{ padding: '8px 16px', background: BLUE, color: 'white', borderRadius: '7px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Seleccionar
                  </button>
                </div>
              </div>

              {/* Número móvil */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Número Móvil <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.numeromovil}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeromovil: e.target.value }))}
                  onBlur={handleNumeroMovilBlur}
                  placeholder="Ej: 101"
                  style={inputStyle}
                />
                {cargandoVehiculo && (
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', margin: '4px 0 0 0' }}>Cargando datos del vehículo...</p>
                )}
              </div>
            </div>

            {/* Placa (auto-fill) */}
            {formData.placa && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={formData.placa}
                  readOnly
                  style={{ ...inputStyle, background: '#f8fafc', fontFamily: 'monospace' }}
                />
              </div>
            )}

            {/* Datos del vehículo (auto-fill) */}
            {datosVehiculo && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>Datos del Vehículo</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Placa:</span>
                    <p style={{ fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.placa}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Tipo:</span>
                    <p style={{ fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.nombretipobus}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Capacidad:</span>
                    <p style={{ fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.capacidad} pasajeros</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Pisos:</span>
                    <p style={{ fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.cantidadpisos}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conductores del vehículo (auto-fill) */}
            {conductoresVehiculo.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conductoresVehiculo.filter(c => !c.esremplazo).map((conductor, idx) => (
                  <div key={conductor.idusuario}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                      {idx === 0 ? 'Conductor Principal' : 'Conductor Secundario'}
                    </label>
                    <input
                      type="text"
                      value={`${conductor.nombre} ${conductor.apellido} - ${conductor.documento}`}
                      readOnly
                      style={{ ...inputStyle, background: '#f8fafc' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Fecha de salida */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Fecha de Salida <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.fechasalida}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechasalida: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Hora de salida */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Hora de Salida <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="time"
                  value={formData.horasalida}
                  onChange={(e) => setFormData(prev => ({ ...prev, horasalida: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{ padding: '10px 24px', background: BLUE, color: 'white', borderRadius: '7px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Programar Viaje
              </button>
            </div>
          </form>
        </section>

        {/* Filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(['todos', 'activos', 'inactivos'] as const).map((f) => (
            <button 
              key={f} 
              onClick={() => { setFiltro(f); setPaginaActual(1); }}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filtro === f ? BLUE : '#e2e8f0',
                background: filtro === f ? BLUE : 'white',
                color: filtro === f ? 'white' : '#64748b',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
              }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tabla de viajes */}
        <section style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px', margin: 0 }}>Viajes Programados</h3>
            {paginacion && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Total: <span style={{ fontWeight: 700, color: '#475569' }}>{paginacion.total}</span> viajes
              </span>
            )}
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>progress_activity</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Cargando viajes...</span>
            </div>
          ) : viajes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>route</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>No hay viajes programados</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ background: '#f8fafc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '16px 20px' }}>ID</th>
                    <th style={{ padding: '16px 20px' }}>Ruta</th>
                    <th style={{ padding: '16px 20px' }}>Vehículo</th>
                    <th style={{ padding: '16px 20px' }}>Conductor</th>
                    <th style={{ padding: '16px 20px' }}>Fecha</th>
                    <th style={{ padding: '16px 20px' }}>Hora</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center' }}>Estado</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid #f1f5f9' }}>
                  {viajes.map((v: any) => (
                    <tr key={v.idviaje} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#1e293b', fontWeight: 600 }}>{v.idviaje}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{v.nombreruta || '—'}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {v.ciudadorigen} → {v.ciudaddestino}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>
                            directions_bus
                          </span>
                          <span style={{ fontFamily: 'monospace', color: '#475569' }}>{v.numeromovil}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>
                        {v.nombreconductor && v.apellidoconductor 
                          ? `${v.nombreconductor} ${v.apellidoconductor}`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{formatearFecha(v.fechasalida)}</td>
                      <td style={{ padding: '12px 20px', color: '#475569' }}>{formatearHora(v.horasalida)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <BadgeEstado estado={v.estado} />
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => handleVerDetalles(v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                            title="Ver detalles">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                          </button>
                          <button 
                            onClick={() => handleToggle(v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.activo ? '#f59e0b' : '#22c55e', padding: 0 }}
                            title={v.activo ? 'Desactivar' : 'Activar'}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                              {v.activo ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {paginacion && paginacion.totalPaginas > 1 && (
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Página {paginacion.paginaActual} de {paginacion.totalPaginas} — {paginacion.total} viajes
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setPaginaActual(paginacion.paginaActual - 1)}
                  disabled={paginacion.paginaActual === 1}
                  style={{ padding: '4px 12px', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', cursor: paginacion.paginaActual === 1 ? 'not-allowed' : 'pointer', opacity: paginacion.paginaActual === 1 ? 0.4 : 1, fontFamily: 'inherit' }}>
                  Anterior
                </button>
                {Array.from({ length: paginacion.totalPaginas }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    onClick={() => setPaginaActual(p)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: p === paginacion.paginaActual ? BLUE : '#e2e8f0',
                      background: p === paginacion.paginaActual ? BLUE : 'white',
                      color: p === paginacion.paginaActual ? 'white' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}>
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPaginaActual(paginacion.paginaActual + 1)}
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  style={{ padding: '4px 12px', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', cursor: paginacion.paginaActual === paginacion.totalPaginas ? 'not-allowed' : 'pointer', opacity: paginacion.paginaActual === paginacion.totalPaginas ? 0.4 : 1, fontFamily: 'inherit' }}>
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modales */}
      <ModalSeleccionarRuta
        isOpen={mostrarModalRuta}
        onClose={() => setMostrarModalRuta(false)}
        onSelect={handleSeleccionarRuta}
      />

      <ModalDetallesViaje
        viaje={viajeDetalles}
        onClose={() => setViajeDetalles(null)}
        cargando={cargandoDetalles}
      />
    </Layout>
  );
};
