import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useVehiculos } from '../../hooks/useVehiculos';
import { useTiposBus } from '../../hooks/useTiposBus';
import { vehiculosApi as vehiculosService } from '../../../infrastructure/services/vehiculosApi';
import ModalDetalleVehiculo from '../../components/vehiculos/ModalDetalleVehiculo';
import FormularioVehiculoMultiPaso from '../../components/vehiculos/FormularioVehiculoMultiPaso';
import type { EstadoVehiculo } from '../../../domain/entities/Vehiculo';

const BLUE = '#0D3B8E';

import DisenadorAsientos from '../../components/vehiculos/DisenadorAsientos';

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
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: '6px',
      }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px',
  fontSize: '13px', color: '#334155', outline: 'none',
  background: 'white', fontFamily: 'inherit',
};

/* ═══════════════════════════════════════════════════════════ */
export const VehiculosPage = () => {
  const { create, update } = useVehiculos();
  const { tiposBus } = useTiposBus();
  const tiposBusList = Array.isArray(tiposBus) ? tiposBus : [];

  /* ── navigation state ────────────────────────────────────── */
  const [vistaActual, setVistaActual] = useState<'formulario' | 'lista'>('lista');
  const [mostrarFormularioMultiPaso, setMostrarFormularioMultiPaso] = useState(false);
  const [vehiculoIdEdicion, setVehiculoIdEdicion] = useState<string | null>(null);

  /* ── form state ──────────────────────────────────────────── */
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [numeromovil, setNumeromovil] = useState('');
  const [año, setAño] = useState('');
  const [tipoBusId, setTipoBusId] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [estado, setEstado] = useState<EstadoVehiculo>('DISPONIBLE');
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── API state for lista view ────────────────────────────── */
  const [vehiculosApi, setVehiculosApi] = useState<any[]>([]);
  const [paginacionApi, setPaginacionApi] = useState<any>(null);
  const [paginaActualApi, setPaginaActualApi] = useState(1);
  const [filtroApi, setFiltroApi] = useState('todos');
  const [busquedaApi, setBusquedaApi] = useState('');
  const [cargandoApi, setCargandoApi] = useState(false);
  const [vehiculoDetalle, setVehiculoDetalle] = useState<any>(null);

  /* ── seat config state ───────────────────────────────────── */
  const [distribucionFinal, setDistribucionFinal] = useState<any>(null);
  const [initialDistribucion, setInitialDistribucion] = useState<any[] | undefined>(undefined);

  const handleDesignerChange = useCallback((dist: any) => {
    setDistribucionFinal(dist);
  }, []);

  // Sincronizar capacidad si el diseñador cambia (solo si es necesario para evitar bucles)
  useEffect(() => {
    if (!distribucionFinal?.distribucion) return;
    
    const realCap = distribucionFinal.distribucion.filter((a: any) => !a.vacio && !a.esPasillo && !a.esBano).length;
    if (realCap > 0) {
      const currentCap = Number(capacidad) || 0;
      if (realCap !== currentCap) {
        setCapacidad(String(realCap));
      }
    }
  }, [distribucionFinal?.distribucion]);

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


  /* ── helpers ─────────────────────────────────────────────── */
  const resetForm = () => {
    setPlaca(''); setMarca(''); setNumeromovil(''); setAño('');
    setTipoBusId(''); setCapacidad(''); setEstado('DISPONIBLE');
    setActivo(true); setEditingId(null);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !numeromovil.trim()) {
      setFormMsg({ type: 'err', text: 'Placa y número móvil son requeridos.' });
      return;
    }
    const payload = {
      placa, numeromovil, marca,
      año: Number(año) || new Date().getFullYear(),
      tipoBusId, capacidad: Number(capacidad) || 0,
      estado, activo,
      distribucionasientos: distribucionFinal,
    };

    if (editingId) {
      update.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { setFormMsg({ type: 'ok', text: 'Vehículo actualizado.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
        onError: () => { setFormMsg({ type: 'err', text: 'Error al actualizar.' }); setTimeout(() => setFormMsg(null), 3000); },
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { setFormMsg({ type: 'ok', text: 'Vehículo guardado.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
        onError: () => { setFormMsg({ type: 'err', text: 'Error al guardar.' }); setTimeout(() => setFormMsg(null), 3000); },
      });
    }
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

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
          <button
            onClick={() => {
              if (!editingId) resetForm();
              setVistaActual('formulario');
            }}
            style={{
              padding: '14px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: vistaActual === 'formulario' ? `3px solid ${BLUE}` : '3px solid transparent',
              color: vistaActual === 'formulario' ? BLUE : '#64748b',
              fontSize: '14px',
              fontWeight: vistaActual === 'formulario' ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{editingId ? 'edit_square' : 'add_circle'}</span>
            {editingId ? 'Editar Vehículo' : 'Crear Vehículo'}
          </button>
        </div>
      </div>

      {vistaActual === 'formulario' ? (
        <>
      {/* ── Row: Formulario + Asientos ─────────────────────── */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', marginBottom: '24px' }}>

      {/* ── Formulario Añadir / Editar Vehículo ────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2', padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>
            directions_bus
          </span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            {editingId ? 'Editar Vehículo' : 'Información del Vehículo'}
          </span>
        </div>

        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Fila 1: Número Móvil + Placa */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Número Móvil">
              <input value={marca} onChange={e => setMarca(e.target.value)}
                placeholder="Ej. 1045" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Placa" required>
              <input value={placa} onChange={e => setPlaca(e.target.value)}
                placeholder="EJ: ABC-123" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          {/* Fila 2: Tipo de Servicio + Tipo de Bus */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Tipo de Servicio">
              <select value={estado} onChange={e => setEstado(e.target.value as EstadoVehiculo)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="FUERA_SERVICIO">Fuera de Servicio</option>
              </select>
            </Field>
            <Field label="Tipo de Bus">
              <select value={tipoBusId} onChange={e => setTipoBusId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Seleccionar...</option>
                {tiposBusList.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Fila 3: Modelo + Capacidad + Cantidad de Pisos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <Field label="Marca">
              <input value={marca} onChange={e => setMarca(e.target.value)}
                placeholder="Ej. Mercedes Benz" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Capacidad Pasajeros">
              <input type="number" value={capacidad} onChange={e => setCapacidad(e.target.value)}
                placeholder="Ej. 42" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Cantidad de Pisos">
              <input type="number" value={año} onChange={e => setAño(e.target.value)}
                placeholder="1" style={inputStyle}
                onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </div>

          {/* Sección: Asignación de Conductores */}
          <div style={{ marginTop: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: BLUE }}>person</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Asignación de Conductores</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Conductor Principal" required>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', color: '#cbd5e1',
                  }}>search</span>
                  <input placeholder="Buscar por nombre o cc"
                    style={{ ...inputStyle, paddingLeft: '34px' }}
                    onFocus={focusBorder} onBlur={blurBorder} />
                </div>
              </Field>
              <Field label="Segundo Conductor (Opcional)">
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', color: '#cbd5e1',
                  }}>search</span>
                  <input placeholder="Buscar por nombre o cc"
                    style={{ ...inputStyle, paddingLeft: '34px' }}
                    onFocus={focusBorder} onBlur={blurBorder} />
                </div>
              </Field>
            </div>
          </div>

          {/* Botón Guardar - ancho completo */}
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'white', color: '#64748b',
                border: '1px solid #cbd5e1', borderRadius: '10px',
                padding: '14px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                Cancelar
              </button>
            )}
            <button type="submit" style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: BLUE, color: 'white',
              border: 'none', borderRadius: '10px',
              padding: '14px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {editingId ? 'edit' : 'save'}
              </span>
              {editingId ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
            </button>
          </div>

          {formMsg && (
            <p style={{
              marginTop: '10px', fontSize: '13px', fontWeight: 600,
              color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626',
              textAlign: 'center',
            }}>{formMsg.text}</p>
          )}
        </form>
      </div>

      {/* ── Configuración de Asientos (DisenadorAsientos Oficial) ── */}
      <div style={{
        background: 'white', borderRadius: '14px',
        border: '1px solid #e2e8f0', padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        flex: 1, minWidth: 0, 
        display: 'flex', flexDirection: 'column',
      }}>
        <DisenadorAsientos 
          key={editingId || 'nuevo'}
          capacidad={Number(capacidad) || 0}
          onChange={handleDesignerChange}
          valorInicial={initialDistribucion}
        />
      </div>

      </div>{/* end flex row */}
        </>
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
                    { label: 'Placa',       width: '110px' },
                    { label: 'Nº Móvil',    width: '100px' },
                    { label: 'Tipo Bus',    width: '140px' },
                    { label: 'Capacidad',   width: '90px'  },
                    { label: 'Estado',      width: '120px' },
                    { label: 'Acciones',    width: '120px'  },
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
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No se encontraron vehículos.
                    </td>
                  </tr>
                ) : (
                  vehiculosApi.map((v: any) => (
                    <tr key={v.idvehiculo} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{v.placa}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{v.numeromovil}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{v.nombretipobus || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{v.capacidad}</td>
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

