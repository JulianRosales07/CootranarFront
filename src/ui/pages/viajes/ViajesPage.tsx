import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useViajes } from '../../hooks/useViajes';
import { useSidebar } from '../../context/SidebarContext';
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
  const estados: Record<string, { bg: string; color: string; texto: string; border: string }> = {
    'PROGRAMADO': { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', texto: 'PROGRAMADO' },
    'EN_CAMINO': { bg: '#dcfce7', color: '#166534', border: '#bbf7d0', texto: 'EN CAMINO' },
    'FINALIZADO': { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', texto: 'FINALIZADO' },
    'CANCELADO': { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', texto: 'CANCELADO' }
  };
  
  const config = estados[estado] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', texto: estado || '—' };
  
  return (
    <span style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px', 
      borderRadius: '20px', 
      background: config.bg, 
      color: config.color,
      border: `1px solid ${config.border}`,
      fontSize: '11px', 
      fontWeight: 700,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap'
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
  const { isMobile, theme } = useSidebar();
  const isDark = theme === 'dark';

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

  const { viajes, paginacion, isLoading, refetch: _refetch, crear, activar, desactivar } = useViajes(filtro, paginaActual, busqueda);

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
    padding: '10px 12px',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13.5px',
    color: isDark ? '#f8fafc' : '#334155',
    outline: 'none',
    background: isDark ? '#18181b' : 'white',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  return (
    <Layout>
      <div style={{ 
        padding: isMobile ? '0 0 24px' : '0 0 32px', 
        maxWidth: '1600px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '16px' : '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Formulario para programar viaje */}
        <section style={{ 
          background: isDark ? '#141417' : 'white', 
          borderRadius: isMobile ? '12px' : '16px', 
          boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.03)', 
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9', 
          padding: isMobile ? '16px' : '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add_road
              </span>
            </div>
            <h3 style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', fontSize: isMobile ? '15px' : '16px', margin: 0 }}>
              Programar Nuevo Viaje
            </h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '16px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: isMobile ? '14px' : '16px' 
            }}>
              {/* Selección de ruta */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b', marginBottom: '6px' }}>
                  Ruta <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={formData.nombreruta}
                    readOnly
                    placeholder="Seleccione una ruta"
                    style={{ 
                      ...inputStyle, 
                      flex: 1, 
                      background: isDark ? '#1e1e24' : '#f8fafc',
                      cursor: 'pointer'
                    }}
                    onClick={() => setMostrarModalRuta(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarModalRuta(true)}
                    style={{ 
                      padding: isMobile ? '0 12px' : '8px 16px', 
                      background: BLUE, 
                      color: 'white', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                    <span>{isMobile ? 'Buscar' : 'Seleccionar'}</span>
                  </button>
                </div>
              </div>

              {/* Número móvil */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b', marginBottom: '6px' }}>
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
                  <p style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sync</span>
                    Cargando datos del vehículo...
                  </p>
                )}
              </div>
            </div>

            {/* Placa (auto-fill) */}
            {formData.placa && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b', marginBottom: '6px' }}>
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={formData.placa}
                  readOnly
                  style={{ ...inputStyle, background: isDark ? '#1e1e24' : '#f8fafc', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            )}

            {/* Datos del vehículo (auto-fill) */}
            {datosVehiculo && (
              <div style={{ 
                background: isDark ? 'rgba(30, 58, 138, 0.2)' : '#eff6ff', 
                border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe', 
                borderRadius: '10px', 
                padding: isMobile ? '12px' : '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3b82f6' }}>directions_bus</span>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#93c5fd' : '#1e40af', margin: 0 }}>Datos del Vehículo</h4>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
                  gap: '10px', 
                  fontSize: '11.5px' 
                }}>
                  <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'white', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Placa:</span>
                    <p style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0', fontFamily: 'monospace' }}>{datosVehiculo.placa}</p>
                  </div>
                  <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'white', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Tipo:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.nombretipobus}</p>
                  </div>
                  <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'white', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Capacidad:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.capacidad} pas.</p>
                  </div>
                  <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'white', padding: '8px 10px', borderRadius: '6px' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10.5px' }}>Pisos:</span>
                    <p style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b', margin: '2px 0 0 0' }}>{datosVehiculo.cantidadpisos}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conductores del vehículo (auto-fill) */}
            {conductoresVehiculo.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conductoresVehiculo.filter(c => !c.esremplazo).map((conductor, idx) => (
                  <div key={conductor.idusuario}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b', marginBottom: '6px' }}>
                      {idx === 0 ? 'Conductor Principal' : 'Conductor Secundario'}
                    </label>
                    <input
                      type="text"
                      value={`${conductor.nombre} ${conductor.apellido} - ${conductor.documento}`}
                      readOnly
                      style={{ ...inputStyle, background: isDark ? '#1e1e24' : '#f8fafc' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
              gap: isMobile ? '12px' : '16px' 
            }}>
              {/* Fecha de salida */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b', marginBottom: '6px' }}>
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

            <div style={{ 
              display: 'flex', 
              justifyContent: isMobile ? 'stretch' : 'flex-end', 
              marginTop: '4px' 
            }}>
              <button
                type="submit"
                style={{ 
                  width: isMobile ? '100%' : 'auto',
                  padding: '11px 24px', 
                  background: BLUE, 
                  color: 'white', 
                  borderRadius: '8px', 
                  fontSize: '13.5px', 
                  fontWeight: 700, 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(13, 59, 142, 0.25)',
                  transition: 'background-color 0.15s, transform 0.1s'
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>event_available</span>
                <span>Programar Viaje</span>
              </button>
            </div>
          </form>
        </section>

        {/* Filtros */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}>
          {(['todos', 'activos', 'inactivos'] as const).map((f) => (
            <button 
              key={f} 
              onClick={() => { setFiltro(f); setPaginaActual(1); }}
              style={{
                padding: '7px 18px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filtro === f ? BLUE : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                background: filtro === f ? BLUE : (isDark ? '#18181b' : 'white'),
                color: filtro === f ? 'white' : (isDark ? '#cbd5e1' : '#64748b'),
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: filtro === f ? '0 2px 6px rgba(13,59,142,0.2)' : 'none'
              }}>
              {f === 'todos' ? 'Todos' : f === 'activos' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>

        {/* Lista / Tabla de viajes */}
        <section style={{ 
          background: isDark ? '#141417' : 'white', 
          borderRadius: isMobile ? '12px' : '16px', 
          boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.03)', 
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9', 
          overflow: 'hidden' 
        }}>
          {/* Header del bloque */}
          <div style={{ 
            padding: isMobile ? '14px 16px' : '16px 24px', 
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f1f5f9', 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '12px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#3b82f6' }}>
                  format_list_bulleted
                </span>
                <h3 style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', fontSize: isMobile ? '15px' : '16px', margin: 0 }}>
                  Viajes Programados
                </h3>
              </div>
              {paginacion && (
                <span style={{ 
                  fontSize: '11.5px', 
                  color: isDark ? '#94a3b8' : '#64748b', 
                  background: isDark ? '#27272a' : '#f1f5f9', 
                  padding: '3px 9px', 
                  borderRadius: '20px',
                  fontWeight: 600
                }}>
                  {paginacion.total} {paginacion.total === 1 ? 'viaje' : 'viajes'}
                </span>
              )}
            </div>

            {/* Buscador de viaje */}
            <div style={{ position: 'relative', width: isMobile ? '100%' : '280px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>search</span>
              </span>
              <input 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: busqueda ? '32px' : '14px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  background: isDark ? '#1e1e24' : '#f8fafc',
                  color: isDark ? '#f8fafc' : '#475569',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                placeholder="Buscar por ruta o placa..." 
                type="text" 
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '48px 16px' : '64px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px', color: '#3b82f6' }}>progress_activity</span>
              <span style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Cargando viajes...</span>
            </div>
          ) : viajes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '48px 16px' : '64px 0', color: '#cbd5e1', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '44px', color: isDark ? '#3f3f46' : '#cbd5e1' }}>route</span>
              <span style={{ fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>No hay viajes programados</span>
              <span style={{ fontSize: '12px', color: isDark ? '#52525b' : '#94a3b8' }}>Programa un nuevo viaje arriba para comenzar</span>
            </div>
          ) : isMobile ? (
            /* ── VISTA MÓVIL: Tarjetas modernas y limpias ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
              {viajes.map((v: any) => (
                <div 
                  key={v.idviaje} 
                  style={{
                    background: isDark ? '#18181b' : '#ffffff',
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Encabezado de la tarjeta: ID, Estado y Acciones */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        color: BLUE, 
                        background: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontFamily: 'monospace' 
                      }}>
                        #{v.idviaje}
                      </span>
                      <BadgeEstado estado={v.estado} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => handleVerDetalles(v)}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                          background: isDark ? '#27272a' : '#f8fafc', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: isDark ? '#cbd5e1' : '#475569', 
                          cursor: 'pointer' 
                        }}
                        title="Ver detalles"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                      </button>
                      <button 
                        onClick={() => handleToggle(v)}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                          background: isDark ? '#27272a' : '#f8fafc', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: v.activo ? '#22c55e' : '#94a3b8', 
                          cursor: 'pointer' 
                        }}
                        title={v.activo ? 'Desactivar' : 'Activar'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          {v.activo ? 'toggle_on' : 'toggle_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Ruta */}
                  <div style={{ 
                    borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9', 
                    paddingTop: '8px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#3b82f6', flexShrink: 0 }}>
                        route
                      </span>
                      <p style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '13.5px', margin: 0, lineHeight: 1.2 }}>
                        {v.ciudadorigen} → {v.ciudaddestino}
                      </p>
                    </div>
                    {v.nombreruta && (
                      <p style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', margin: '2px 0 0 23px' }}>
                        {v.nombreruta}
                      </p>
                    )}
                  </div>

                  {/* Grilla de datos 2x2 */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px', 
                    fontSize: '11.5px',
                    background: isDark ? '#212126' : '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isDark ? '#cbd5e1' : '#475569' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>directions_bus</span>
                      <span>Móvil <strong style={{ fontFamily: 'monospace' }}>{v.numeromovil || '—'}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isDark ? '#cbd5e1' : '#475569', minWidth: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8', flexShrink: 0 }}>person</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.nombreconductor ? `${v.nombreconductor} ${v.apellidoconductor || ''}` : 'Sin conductor'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isDark ? '#cbd5e1' : '#475569' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>calendar_today</span>
                      <span>{formatearFecha(v.fechasalida)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isDark ? '#cbd5e1' : '#475569' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>schedule</span>
                      <span style={{ fontWeight: 600 }}>{formatearHora(v.horasalida)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── VISTA ESCRITORIO: Tabla Completa ── */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead style={{ background: isDark ? '#1a1a1e' : '#f8fafc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>ID</th>
                    <th style={{ padding: '14px 20px' }}>Ruta</th>
                    <th style={{ padding: '14px 20px' }}>Vehículo</th>
                    <th style={{ padding: '14px 20px' }}>Conductor</th>
                    <th style={{ padding: '14px 20px' }}>Fecha</th>
                    <th style={{ padding: '14px 20px' }}>Hora</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>Estado</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
                  {viajes.map((v: any) => (
                    <tr 
                      key={v.idviaje} 
                      style={{ 
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f1f5f9',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: isDark ? '#f8fafc' : '#1e293b', fontWeight: 600 }}>{v.idviaje}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b' }}>{v.nombreruta || '—'}</span>
                          <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                            {v.ciudadorigen} → {v.ciudaddestino}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>
                            directions_bus
                          </span>
                          <span style={{ fontFamily: 'monospace', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>{v.numeromovil}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', color: isDark ? '#cbd5e1' : '#475569' }}>
                        {v.nombreconductor && v.apellidoconductor 
                          ? `${v.nombreconductor} ${v.apellidoconductor}`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px 20px', color: isDark ? '#cbd5e1' : '#475569' }}>{formatearFecha(v.fechasalida)}</td>
                      <td style={{ padding: '12px 20px', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>{formatearHora(v.horasalida)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <BadgeEstado estado={v.estado} />
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => handleVerDetalles(v)}
                            style={{ 
                              background: isDark ? '#27272a' : '#f1f5f9', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              color: isDark ? '#cbd5e1' : '#475569', 
                              width: '30px', 
                              height: '30px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              padding: 0 
                            }}
                            title="Ver detalles">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                          <button 
                            onClick={() => handleToggle(v)}
                            style={{ 
                              background: isDark ? '#27272a' : '#f1f5f9', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              color: v.activo ? '#22c55e' : '#94a3b8', 
                              width: '30px', 
                              height: '30px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              padding: 0 
                            }}
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
            <div style={{ 
              background: isDark ? '#1a1a1e' : '#f8fafc', 
              padding: isMobile ? '12px 16px' : '14px 20px', 
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f1f5f9', 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <span style={{ fontSize: '11.5px', color: isDark ? '#94a3b8' : '#64748b' }}>
                Página <strong>{paginacion.paginaActual}</strong> de <strong>{paginacion.totalPaginas}</strong> ({paginacion.total} viajes)
              </span>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  onClick={() => setPaginaActual(paginacion.paginaActual - 1)}
                  disabled={paginacion.paginaActual === 1}
                  style={{ 
                    padding: '5px 12px', 
                    borderRadius: '6px', 
                    background: isDark ? '#27272a' : 'white', 
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                    color: isDark ? '#cbd5e1' : '#64748b', 
                    fontSize: '11.5px', 
                    cursor: paginacion.paginaActual === 1 ? 'not-allowed' : 'pointer', 
                    opacity: paginacion.paginaActual === 1 ? 0.4 : 1, 
                    fontFamily: 'inherit',
                    fontWeight: 600
                  }}>
                  Anterior
                </button>

                {!isMobile && Array.from({ length: paginacion.totalPaginas }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    onClick={() => setPaginaActual(p)}
                    style={{
                      minWidth: '28px',
                      height: '28px',
                      padding: '0 6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: p === paginacion.paginaActual ? BLUE : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      background: p === paginacion.paginaActual ? BLUE : (isDark ? '#27272a' : 'white'),
                      color: p === paginacion.paginaActual ? 'white' : (isDark ? '#cbd5e1' : '#64748b'),
                      fontSize: '11.5px',
                      fontWeight: p === paginacion.paginaActual ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}>
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPaginaActual(paginacion.paginaActual + 1)}
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  style={{ 
                    padding: '5px 12px', 
                    borderRadius: '6px', 
                    background: isDark ? '#27272a' : 'white', 
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                    color: isDark ? '#cbd5e1' : '#64748b', 
                    fontSize: '11.5px', 
                    cursor: paginacion.paginaActual === paginacion.totalPaginas ? 'not-allowed' : 'pointer', 
                    opacity: paginacion.paginaActual === paginacion.totalPaginas ? 0.4 : 1, 
                    fontFamily: 'inherit',
                    fontWeight: 600
                  }}>
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
