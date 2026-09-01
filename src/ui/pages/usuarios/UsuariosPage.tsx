import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usuariosApi } from '../../../infrastructure/services/usuariosApi';
import type { UsuarioDTO, VehiculoPropietarioDTO } from '../../../infrastructure/services/usuariosApi';

const BLUE = '#0D3B8E';
const BLUE_HOVER = '#092C6B';

// Estilos de badge por Rol
const ROL_CONFIG: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  ADMINISTRADOR: { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', icon: 'admin_panel_settings' },
  PROPIETARIO: { bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: 'key' },
  TAQUILLERO: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', icon: 'confirmation_number' },
  ENCOMIENDAS: { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa', icon: 'inventory_2' },
  CONDUCTOR: { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4', icon: 'badge' },
  CLIENTE: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: 'shopping_bag' },
};

function RolBadge({ rol }: { rol?: string }) {
  const config = (rol && ROL_CONFIG[rol.toUpperCase()]) || {
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
    icon: 'person',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '20px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
        {config.icon}
      </span>
      {rol || 'Sin Rol'}
    </span>
  );
}

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '20px',
        background: activo ? '#dcfce7' : '#fee2e2',
        color: activo ? '#15803d' : '#dc2626',
        border: `1px solid ${activo ? '#bbf7d0' : '#fecaca'}`,
        fontSize: '11.5px',
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: activo ? '#16a34a' : '#dc2626',
        }}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function EcommerceBadge({ tieneEcommerce }: { tieneEcommerce?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 9px',
        borderRadius: '6px',
        background: tieneEcommerce ? '#eff6ff' : '#f8fafc',
        color: tieneEcommerce ? '#1d4ed8' : '#94a3b8',
        border: `1px solid ${tieneEcommerce ? '#bfdbfe' : '#e2e8f0'}`,
        fontSize: '11px',
        fontWeight: 600,
      }}
      title={
        tieneEcommerce
          ? 'Cuenta autorizada y activa para ingresar a la plataforma de venta E-commerce'
          : 'Sin acceso configurado para la plataforma E-commerce'
      }
    >
      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
        {tieneEcommerce ? 'storefront' : 'do_not_disturb_on'}
      </span>
      {tieneEcommerce ? 'Habilitado' : 'Sin Acceso'}
    </span>
  );
}

function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        minWidth: '32px',
        height: '32px',
        padding: '0 8px',
        border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
        borderRadius: '6px',
        background: active ? BLUE : 'white',
        color: active ? 'white' : '#475569',
        fontSize: '13px',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

function NavArrow({ icon, disabled, onClick }: { icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '32px',
        height: '32px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#cbd5e1' : '#475569',
        transition: 'all 0.15s ease',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {icon}
      </span>
    </button>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '5px',
        }}
      >
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>{hint}</span>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '7px',
  fontSize: '13px',
  color: '#1e293b',
  outline: 'none',
  background: 'white',
  fontFamily: 'inherit',
};

export const UsuariosPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterRol, setFilterRol] = useState('TODOS');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [search, setSearch] = useState('');

  const {
    usuarios,
    roles,
    paginacion,
    isLoading,
    isFetching,
    create,
    update,
    cambiarRol,
    cambiarEstado,
    configurarAccesoEcommerce,
  } = useUsuarios({
    page,
    limit,
    rol: filterRol !== 'TODOS' ? filterRol : undefined,
    estado: filterEstado !== 'TODOS' ? filterEstado : undefined,
    busqueda: search.trim() || undefined,
  });

  // Modales
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalRolEcommerceOpen, setModalRolEcommerceOpen] = useState(false);
  const [modalVehiculosOpen, setModalVehiculosOpen] = useState(false);

  // Estados de formularios
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioDTO | null>(null);
  const [vehiculosPropietario, setVehiculosPropietario] = useState<VehiculoPropietarioDTO[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

  // Form State Crear/Editar
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    tipodocumento: 'CC',
    documento: '',
    telefono: '',
    idrol: 0,
    habilitarEcommerce: false,
  });

  // Form State Rol & Ecommerce
  const [rolModalState, setRolModalState] = useState({
    idrol: 0,
    habilitarEcommerce: false,
    nuevaPassword: '',
  });

  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Métricas
  const stats = useMemo(() => {
    const total = paginacion?.totalRegistros || usuarios.length;
    const admins = usuarios.filter((u) => u.nombrerol === 'ADMINISTRADOR').length;
    const propietarios = usuarios.filter((u) => u.nombrerol === 'PROPIETARIO').length;
    const ecommerce = usuarios.filter((u) => u.tiene_ecommerce).length;
    const operativos = usuarios.filter((u) => ['TAQUILLERO', 'ENCOMIENDAS', 'CONDUCTOR'].includes(u.nombrerol)).length;
    return { total, admins, propietarios, ecommerce, operativos };
  }, [usuarios, paginacion]);

  // Manejadores
  const handleOpenCrear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      tipodocumento: 'CC',
      documento: '',
      telefono: '',
      idrol: roles[0]?.idrol || 0,
      habilitarEcommerce: false,
    });
    setFormMsg(null);
    setModalCrearOpen(true);
  };

  const handleOpenEditar = (u: UsuarioDTO) => {
    setUsuarioSeleccionado(u);
    setFormData({
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      correo: u.correo || '',
      password: '',
      tipodocumento: u.tipodocumento || 'CC',
      documento: u.documento || '',
      telefono: u.telefono || '',
      idrol: u.idrol,
      habilitarEcommerce: !!u.tiene_ecommerce,
    });
    setFormMsg(null);
    setModalEditarOpen(true);
  };

  const handleOpenRolEcommerce = (u: UsuarioDTO) => {
    setUsuarioSeleccionado(u);
    setRolModalState({
      idrol: u.idrol,
      habilitarEcommerce: !!u.tiene_ecommerce,
      nuevaPassword: '',
    });
    setFormMsg(null);
    setModalRolEcommerceOpen(true);
  };

  const handleOpenVehiculos = async (u: UsuarioDTO) => {
    setUsuarioSeleccionado(u);
    setLoadingVehiculos(true);
    setModalVehiculosOpen(true);
    try {
      const res: any = await usuariosApi.obtenerVehiculosPropietario(u.idusuario);
      setVehiculosPropietario(res?.data || res || []);
    } catch {
      setVehiculosPropietario([]);
    } finally {
      setLoadingVehiculos(false);
    }
  };

  const handleToggleEstado = async (u: UsuarioDTO) => {
    const nuevoEstado = !u.activo;
    const confirm = window.confirm(
      `¿Estás seguro de que deseas ${nuevoEstado ? 'ACTIVAR' : 'DESACTIVAR'} la cuenta de ${u.nombre} ${u.apellido}?`
    );
    if (!confirm) return;

    try {
      await cambiarEstado.mutateAsync({ idusuario: u.idusuario, activo: nuevoEstado });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Error al cambiar estado');
    }
  };

  const handleSubmitCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.correo.trim() || !formData.documento.trim()) {
      setFormMsg({ type: 'err', text: 'Por favor completa todos los campos obligatorios (*)' });
      return;
    }

    try {
      await create.mutateAsync({
        ...formData,
        idrol: Number(formData.idrol),
      });
      setFormMsg({ type: 'ok', text: 'Usuario creado exitosamente' });
      setTimeout(() => setModalCrearOpen(false), 900);
    } catch (err: any) {
      setFormMsg({
        type: 'err',
        text: err?.response?.data?.message || err?.message || 'Error al registrar usuario',
      });
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    setFormMsg(null);

    try {
      const payload: any = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        documento: formData.documento.trim(),
        tipodocumento: formData.tipodocumento,
        telefono: formData.telefono.trim(),
        idrol: Number(formData.idrol),
        habilitarEcommerce: formData.habilitarEcommerce,
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await update.mutateAsync({
        idusuario: usuarioSeleccionado.idusuario,
        data: payload,
      });

      setFormMsg({ type: 'ok', text: 'Usuario actualizado exitosamente' });
      setTimeout(() => setModalEditarOpen(false), 900);
    } catch (err: any) {
      setFormMsg({
        type: 'err',
        text: err?.response?.data?.message || err?.message || 'Error al actualizar usuario',
      });
    }
  };

  const handleSubmitRolEcommerce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    setFormMsg(null);

    try {
      // Si cambió de rol
      if (rolModalState.idrol !== usuarioSeleccionado.idrol) {
        await cambiarRol.mutateAsync({
          idusuario: usuarioSeleccionado.idusuario,
          idrol: Number(rolModalState.idrol),
        });
      }

      // Configuración de acceso E-commerce
      await configurarAccesoEcommerce.mutateAsync({
        idusuario: usuarioSeleccionado.idusuario,
        habilitar: rolModalState.habilitarEcommerce,
        password: rolModalState.nuevaPassword.trim() || undefined,
      });

      setFormMsg({ type: 'ok', text: 'Rol y accesos de E-commerce configurados correctamente' });
      setTimeout(() => setModalRolEcommerceOpen(false), 1000);
    } catch (err: any) {
      setFormMsg({
        type: 'err',
        text: err?.response?.data?.message || err?.message || 'Error al configurar acceso',
      });
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Cabecera del Módulo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'white',
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BLUE,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  manage_accounts
                </span>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                  Gestión Integral de Usuarios y Roles
                </h1>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Administración de cuentas internas, asignación de roles y control de acceso a E-commerce para propietarios y personal.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCrear}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: BLUE,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(13,59,142,0.25)',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
              person_add
            </span>
            Nuevo Usuario
          </button>
        </div>

        {/* Tarjetas de Métricas Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Total Usuarios', val: stats.total, icon: 'group', color: '#2563eb', bg: '#eff6ff' },
            { label: 'Propietarios de Bus', val: stats.propietarios, icon: 'key', color: '#d97706', bg: '#fef3c7' },
            { label: 'Personal Operativo', val: stats.operativos, icon: 'badge', color: '#059669', bg: '#ecfdf5' },
            { label: 'Con Acceso E-commerce', val: stats.ecommerce, icon: 'shopping_bag', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '10px',
                padding: '14px 18px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  {card.icon}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.label}
                </span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{card.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contenedor Principal: Filtros y Tabla */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          {/* Barra de Filtros */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
            }}
          >
            {/* Buscador */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '380px' }}>
              <span
                className="material-symbols-outlined"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8' }}
              >
                search
              </span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre, documento o correo..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1e293b',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
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
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    close
                  </span>
                </button>
              )}
            </div>

            {/* Selectores de Filtro */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Filtro por Rol */}
              <div style={{ position: 'relative' }}>
                <select
                  value={filterRol}
                  onChange={(e) => {
                    setFilterRol(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 32px 8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    outline: 'none',
                  }}
                >
                  <option value="TODOS">Todos los Roles</option>
                  {roles.map((r) => (
                    <option key={r.idrol} value={r.nombre}>
                      Rol: {r.nombre}
                    </option>
                  ))}
                </select>
                <span
                  className="material-symbols-outlined"
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8', pointerEvents: 'none' }}
                >
                  expand_more
                </span>
              </div>

              {/* Filtro por Estado */}
              <div style={{ position: 'relative' }}>
                <select
                  value={filterEstado}
                  onChange={(e) => {
                    setFilterEstado(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 32px 8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    outline: 'none',
                  }}
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="ACTIVO">Activos</option>
                  <option value="INACTIVO">Inactivos</option>
                </select>
                <span
                  className="material-symbols-outlined"
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8', pointerEvents: 'none' }}
                >
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Estado de Carga */}
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '10px', animation: 'spin 1.5s linear infinite' }}>
                sync
              </span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Cargando directorio de usuarios...</span>
            </div>
          ) : (
            <>
              {/* Tabla de Usuarios */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {[
                        { l: 'Usuario / Correo', w: '260px' },
                        { l: 'Documento', w: '130px' },
                        { l: 'Teléfono', w: '130px' },
                        { l: 'Rol Asignado', w: '160px' },
                        { l: 'Acceso E-commerce', w: '140px' },
                        { l: 'Estado', w: '110px' },
                        { l: 'Acciones', w: '150px' },
                      ].map(({ l, w }) => (
                        <th
                          key={l}
                          style={{
                            width: w,
                            padding: '12px 16px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '50px 20px', textAlign: 'center', color: '#94a3b8' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '38px', display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>
                            person_search
                          </span>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>No se encontraron usuarios</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>Intenta ajustar los términos de búsqueda o filtros.</div>
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((u) => {
                        const isPropietario = u.nombrerol === 'PROPIETARIO';
                        const initials = `${u.nombre?.[0] || ''}${u.apellido?.[0] || ''}`.toUpperCase();

                        return (
                          <tr
                            key={u.idusuario}
                            style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                          >
                            {/* Usuario y Correo */}
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: isPropietario ? '#fef3c7' : '#eff6ff',
                                    color: isPropietario ? '#b45309' : BLUE,
                                    border: `1px solid ${isPropietario ? '#fde68a' : '#bfdbfe'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {u.fotoperfil ? (
                                    <img
                                      src={u.fotoperfil}
                                      alt={u.nombre}
                                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    initials
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                                    {u.nombre} {u.apellido}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>{u.correo}</div>
                                </div>
                              </div>
                            </td>

                            {/* Documento */}
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginRight: '4px' }}>
                                {u.tipodocumento || 'CC'}
                              </span>
                              {u.documento || '—'}
                            </td>

                            {/* Teléfono */}
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                              {u.telefono || '—'}
                            </td>

                            {/* Rol */}
                            <td style={{ padding: '12px 16px' }}>
                              <RolBadge rol={u.nombrerol} />
                            </td>

                            {/* Acceso E-commerce */}
                            <td style={{ padding: '12px 16px' }}>
                              <EcommerceBadge tieneEcommerce={u.tiene_ecommerce} />
                            </td>

                            {/* Estado */}
                            <td style={{ padding: '12px 16px' }}>
                              <EstadoBadge activo={u.activo} />
                            </td>

                            {/* Acciones */}
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {/* Botón Editar Usuario */}
                                <button
                                  title="Editar Información"
                                  onClick={() => handleOpenEditar(u)}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = BLUE;
                                    e.currentTarget.style.borderColor = BLUE;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#475569';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                    edit
                                  </span>
                                </button>

                                {/* Botón Gestionar Rol & Acceso E-commerce */}
                                <button
                                  title="Gestionar Rol y Acceso E-commerce"
                                  onClick={() => handleOpenRolEcommerce(u)}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    background: u.tiene_ecommerce ? '#eff6ff' : 'white',
                                    color: u.tiene_ecommerce ? BLUE : '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#7c3aed';
                                    e.currentTarget.style.borderColor = '#7c3aed';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = u.tiene_ecommerce ? BLUE : '#475569';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                    admin_panel_settings
                                  </span>
                                </button>

                                {/* Botón Ver Vehículos (si es propietario) */}
                                {isPropietario && (
                                  <button
                                    title="Ver Vehículos del Propietario"
                                    onClick={() => handleOpenVehiculos(u)}
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '6px',
                                      border: '1px solid #fde68a',
                                      background: '#fef3c7',
                                      color: '#b45309',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                      directions_bus
                                    </span>
                                  </button>
                                )}

                                {/* Botón Activar/Desactivar */}
                                <button
                                  title={u.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                                  onClick={() => handleToggleEstado(u)}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: u.activo ? '#dc2626' : '#16a34a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = u.activo ? '#fee2e2' : '#dcfce7';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                    {u.activo ? 'block' : 'check_circle'}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderTop: '1px solid #f1f5f9',
                  background: '#ffffff',
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Mostrando{' '}
                  <strong style={{ color: '#0f172a' }}>
                    {paginacion.totalRegistros === 0 ? 0 : (page - 1) * limit + 1}
                  </strong>{' '}
                  a <strong style={{ color: '#0f172a' }}>{Math.min(page * limit, paginacion.totalRegistros)}</strong> de{' '}
                  <strong style={{ color: '#0f172a' }}>{paginacion.totalRegistros}</strong> usuarios{' '}
                  {isFetching && <span style={{ color: '#94a3b8', fontSize: '11px' }}>(actualizando...)</span>}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
                  {Array.from({ length: paginacion.totalPaginas || 1 }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === paginacion.totalPaginas || Math.abs(p - page) <= 2)
                    .map((p) => (
                      <PagBtn key={p} label={String(p)} active={p === page} onClick={() => setPage(p)} />
                    ))}
                  <NavArrow
                    icon="chevron_right"
                    disabled={page >= (paginacion.totalPaginas || 1)}
                    onClick={() => setPage((p) => p + 1)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== MODAL: CREAR USUARIO ==================== */}
      {modalCrearOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: BLUE, fontSize: '22px' }}>
                  person_add
                </span>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Registrar Nuevo Usuario</span>
              </div>
              <button
                onClick={() => setModalCrearOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitCrear} style={{ padding: '20px' }}>
              {formMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                    background: formMsg.type === 'ok' ? '#dcfce7' : '#fee2e2',
                    color: formMsg.type === 'ok' ? '#15803d' : '#dc2626',
                    border: `1px solid ${formMsg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {formMsg.text}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Nombre" required>
                  <input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Carlos"
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="Apellido" required>
                  <input
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Ej. Gómez"
                    style={inputStyle}
                    required
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <Field label="Tipo Doc.">
                  <select
                    value={formData.tipodocumento}
                    onChange={(e) => setFormData({ ...formData, tipodocumento: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="PASAPORTE">PAS</option>
                  </select>
                </Field>
                <Field label="Número Documento" required>
                  <input
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="Ej. 1085244123"
                    style={inputStyle}
                    required
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Correo Electrónico" required>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="Teléfono / Celular">
                  <input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej. 3158901234"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Rol del Sistema" required hint="Asigna los permisos correspondientes">
                  <select
                    value={formData.idrol}
                    onChange={(e) => setFormData({ ...formData, idrol: Number(e.target.value) })}
                    style={inputStyle}
                  >
                    {roles.map((r) => (
                      <option key={r.idrol} value={r.idrol}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Contraseña Inicial" hint="Mínimo 6 caracteres para acceso">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Opción Habilitar Acceso E-commerce */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginTop: '4px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <input
                  type="checkbox"
                  id="chkEcommerce"
                  checked={formData.habilitarEcommerce}
                  onChange={(e) => setFormData({ ...formData, habilitarEcommerce: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: BLUE }}
                />
                <label htmlFor="chkEcommerce" style={{ cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Habilitar Acceso a E-commerce</strong>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Permite al usuario iniciar sesión en la tienda web con su correo y contraseña.
                  </span>
                </label>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setModalCrearOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={create.isPending}
                  style={{
                    padding: '8px 20px',
                    border: 'none',
                    borderRadius: '7px',
                    background: BLUE,
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: create.isPending ? 'default' : 'pointer',
                    boxShadow: '0 2px 4px rgba(13,59,142,0.2)',
                  }}
                >
                  {create.isPending ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDITAR USUARIO ==================== */}
      {modalEditarOpen && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: BLUE, fontSize: '22px' }}>
                  edit
                </span>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                  Editar Usuario: {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                </span>
              </div>
              <button
                onClick={() => setModalEditarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitEditar} style={{ padding: '20px' }}>
              {formMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                    background: formMsg.type === 'ok' ? '#dcfce7' : '#fee2e2',
                    color: formMsg.type === 'ok' ? '#15803d' : '#dc2626',
                    border: `1px solid ${formMsg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {formMsg.text}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Nombre" required>
                  <input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="Apellido" required>
                  <input
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <Field label="Tipo Doc.">
                  <select
                    value={formData.tipodocumento}
                    onChange={(e) => setFormData({ ...formData, tipodocumento: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="PASAPORTE">PAS</option>
                  </select>
                </Field>
                <Field label="Número Documento" required>
                  <input
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Correo Electrónico" required>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="Teléfono / Celular">
                  <input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Rol del Sistema" required>
                  <select
                    value={formData.idrol}
                    onChange={(e) => setFormData({ ...formData, idrol: Number(e.target.value) })}
                    style={inputStyle}
                  >
                    {roles.map((r) => (
                      <option key={r.idrol} value={r.idrol}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Nueva Contraseña (Opcional)" hint="Dejar en blanco para mantener la actual">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={update.isPending}
                  style={{
                    padding: '8px 20px',
                    border: 'none',
                    borderRadius: '7px',
                    background: BLUE,
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: update.isPending ? 'default' : 'pointer',
                  }}
                >
                  {update.isPending ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: GESTIONAR ROL Y ACCESO E-COMMERCE ==================== */}
      {modalRolEcommerceOpen && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#7c3aed', fontSize: '22px' }}>
                  admin_panel_settings
                </span>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                  Gestionar Rol y Acceso E-commerce
                </span>
              </div>
              <button
                onClick={() => setModalRolEcommerceOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitRolEcommerce} style={{ padding: '20px' }}>
              {formMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                    background: formMsg.type === 'ok' ? '#dcfce7' : '#fee2e2',
                    color: formMsg.type === 'ok' ? '#15803d' : '#dc2626',
                    border: `1px solid ${formMsg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {formMsg.text}
                </div>
              )}

              {/* Información del Usuario */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{usuarioSeleccionado.correo}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Documento: {usuarioSeleccionado.documento}
                </div>
              </div>

              {/* Selector de Rol */}
              <Field label="Rol del Usuario en la Plataforma" required hint="Define las atribuciones y perfil principal del usuario">
                <select
                  value={rolModalState.idrol}
                  onChange={(e) => setRolModalState({ ...rolModalState, idrol: Number(e.target.value) })}
                  style={inputStyle}
                >
                  {roles.map((r) => (
                    <option key={r.idrol} value={r.idrol}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Switch de Acceso a E-commerce */}
              <div
                style={{
                  background: rolModalState.habilitarEcommerce ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${rolModalState.habilitarEcommerce ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="chkModalEcommerce"
                    checked={rolModalState.habilitarEcommerce}
                    onChange={(e) => setRolModalState({ ...rolModalState, habilitarEcommerce: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: BLUE }}
                  />
                  <label htmlFor="chkModalEcommerce" style={{ cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      Acceso Autorizado a E-commerce
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Permite que este propietario o usuario pueda iniciar sesión en el portal de comercio electrónico de Cootranar.
                    </div>
                  </label>
                </div>
              </div>

              {/* Configuración de Contraseña */}
              <Field
                label="Asignar / Cambiar Contraseña de Acceso"
                hint="Ingresa una contraseña para que el usuario pueda autenticarse (opcional si ya tiene contraseña establecida)"
              >
                <input
                  type="password"
                  value={rolModalState.nuevaPassword}
                  onChange={(e) => setRolModalState({ ...rolModalState, nuevaPassword: e.target.value })}
                  placeholder="Escribe la nueva contraseña..."
                  style={inputStyle}
                />
              </Field>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setModalRolEcommerceOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={configurarAccesoEcommerce.isPending || cambiarRol.isPending}
                  style={{
                    padding: '8px 20px',
                    border: 'none',
                    borderRadius: '7px',
                    background: '#7c3aed',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(124,58,237,0.25)',
                  }}
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: VEHÍCULOS DEL PROPIETARIO ==================== */}
      {modalVehiculosOpen && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#fef3c7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#b45309', fontSize: '24px' }}>
                  commute
                </span>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#78350f' }}>Vehículos Vinculados</span>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>
                    Propietario: {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido} (Doc: {usuarioSeleccionado.documento})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalVehiculosOpen(false)}
                style={{ background: 'none', border: 'none', color: '#92400e', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {loadingVehiculos ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '30px', animation: 'spin 1.5s linear infinite' }}>
                    sync
                  </span>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>Consultando parque automotor...</div>
                </div>
              ) : vehiculosPropietario.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '6px' }}>
                    no_crash
                  </span>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#64748b' }}>
                    No hay vehículos registrados a nombre de este propietario
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {vehiculosPropietario.map((v) => (
                    <div
                      key={v.idvehiculo}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            background: '#eff6ff',
                            color: BLUE,
                            fontWeight: 800,
                            fontSize: '13px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {v.placa}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                            Móvil #{v.numeromovil}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {v.tipobus_nombre || 'Bus'} • {v.tiposervicio_nombre || 'Servicio'}
                          </div>
                        </div>
                      </div>
                      <EstadoBadge activo={v.activo} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setModalVehiculosOpen(false)}
                  style={{
                    padding: '8px 18px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
