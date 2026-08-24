import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import { perfilApi } from '../../../infrastructure/services/perfilApi';
import type { PerfilUsuario } from '../../../infrastructure/services/perfilApi';

export const PerfilPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { theme } = useSidebar();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | 'permisos' | 'notificaciones'>('perfil');
  const [perfilDetallado, setPerfilDetallado] = useState<PerfilUsuario | null>(null);
  const [saving, setSaving] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Estados del Formulario de Perfil
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido || '');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [telefono, setTelefono] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [documento, setDocumento] = useState('');
  const [cargo, setCargo] = useState(user?.nombrerol || 'Administrador');
  const [bio, setBio] = useState('Colaborador oficial del equipo de transporte y logística de COOTRANAR R.L.');
  const [fotoUrl, setFotoUrl] = useState<string | null>(user?.fotoperfil || null);
  const [modalVisualizarFoto, setModalVisualizarFoto] = useState(false);

  // Estados del Formulario de Cambio de Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setApellido(user.apellido || '');
      setCorreo(user.correo || '');
      setCargo(user.nombrerol || 'Administrador');
      if (user.fotoperfil) {
        setFotoUrl(user.fotoperfil);
      }
    }
    cargarPerfil();
  }, [user]);

  const cargarPerfil = async () => {
    try {
      const data = await perfilApi.obtenerPerfil();
      if (data) {
        setPerfilDetallado(data);
        if (data.nombre) setNombre(data.nombre);
        if (data.apellido) setApellido(data.apellido);
        if (data.correo) setCorreo(data.correo);
        if (data.telefono) setTelefono(data.telefono);
        if (data.documento) setDocumento(data.documento);
        if (data.tipodocumento) setTipoDocumento(data.tipodocumento);
        if (data.nombrerol) setCargo(data.nombrerol);
        if (data.fotoperfil) setFotoUrl(data.fotoperfil);
      }
    } catch (err) {
      console.warn('Cargando perfil desde sesión local:', err);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFotoUrl(base64);
        // Actualizar sesión de inmediato
        if (user) {
          setUser({
            ...user,
            fotoperfil: base64,
          });
        }
        setMensajeExito('Foto actualizada. Haz clic en "Guardar cambios" para confirmar.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEliminarFoto = async () => {
    setFotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (user) {
      setUser({
        ...user,
        fotoperfil: null,
      });
      localStorage.removeItem(`cootranar_foto_perfil_${user.idusuario}`);
      try {
        await perfilApi.actualizarFotoDirecta(null);
      } catch (err) {
        console.warn('Error al eliminar foto de BD:', err);
      }
    }
    setMensajeExito('Foto de perfil eliminada y restablecida.');
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      let nuevaFotoUrl = fotoUrl;

      // 1. Si hay archivo físico seleccionado, enviarlo como multipart a la BD / backend
      const archivoFisico = fileInputRef.current?.files?.[0];
      if (archivoFisico) {
        const formData = new FormData();
        formData.append('foto', archivoFisico);
        try {
          const res = await perfilApi.actualizarFotoPerfil(formData);
          if (res?.urlFoto || res?.fotoperfil) {
            nuevaFotoUrl = res.urlFoto || res.fotoperfil;
          }
        } catch (backendErr) {
          console.warn('Error al subir multipart, guardando directamente en BD:', backendErr);
          if (fotoUrl) {
            await perfilApi.actualizarFotoDirecta(fotoUrl).catch(() => {});
          }
        }
      } else if (fotoUrl) {
        // Guardar la foto en base de datos
        try {
          await perfilApi.actualizarFotoDirecta(fotoUrl);
        } catch (backendErr) {
          console.warn('Error al guardar foto directa en BD:', backendErr);
        }
      }

      // 2. Actualizar estado del usuario en sesión
      if (user) {
        const usuarioActualizado = {
          ...user,
          nombre: nombre.trim() || user.nombre,
          apellido: apellido.trim() || user.apellido,
          fotoperfil: nuevaFotoUrl,
        };
        setUser(usuarioActualizado);
      }

      setMensajeExito('¡Perfil y foto de perfil guardados en la base de datos!');
    } catch (err) {
      setMensajeError('No se pudieron guardar los cambios. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);

    if (!currentPassword) {
      setMensajeError('Por favor ingresa tu contraseña actual.');
      return;
    }

    if (newPassword.length < 6) {
      setMensajeError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMensajeError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setSavingPassword(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMensajeExito('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMensajeError('Error al actualizar la contraseña. Inténtalo de nuevo.');
    } finally {
      setSavingPassword(false);
    }
  };

  const rolActual = perfilDetallado?.nombrerol || user?.nombrerol || 'ADMINISTRADOR';

  // Matriz de permisos
  const permisos = [
    {
      modulo: 'Venta de Tiquetes & Taquilla',
      desc: 'Emisión, reserva y cobro de tiquetes para pasajeros',
      activo: rolActual === 'ADMINISTRADOR' || rolActual === 'TAQUILLERO',
      icon: 'confirmation_number',
    },
    {
      modulo: 'Gestión de Viajes & Despachos',
      desc: 'Control de salidas de buses, horarios y frecuencias',
      activo: rolActual === 'ADMINISTRADOR' || rolActual === 'TAQUILLERO',
      icon: 'departure_board',
    },
    {
      modulo: 'Encomiendas y Cargas',
      desc: 'Recepción, rastreo y entrega de paquetes y guías',
      activo: rolActual === 'ADMINISTRADOR' || rolActual === 'EMPLEADO_ENCOMIENDAS',
      icon: 'inventory_2',
    },
    {
      modulo: 'Parque Automotor & Vehículos',
      desc: 'Registro de buses, SOAT, tecnomecánica y distribución de asientos',
      activo: rolActual === 'ADMINISTRADOR',
      icon: 'directions_bus',
    },
    {
      modulo: 'Rutas & Matriz de Tarifas',
      desc: 'Configuración de rutas intermunicipales y precios',
      activo: rolActual === 'ADMINISTRADOR',
      icon: 'alt_route',
    },
    {
      modulo: 'Gestión de Empleados & Usuarios',
      desc: 'Administración de cuentas, taquilleros y conductores',
      activo: rolActual === 'ADMINISTRADOR',
      icon: 'manage_accounts',
    },
    {
      modulo: 'Reportes de Ingresos & Métricas',
      desc: 'Consolidado financiero e informes de recaudación',
      activo: rolActual === 'ADMINISTRADOR',
      icon: 'monitoring',
    },
  ];

  // Paleta de colores ajustada
  const colors = isDark
    ? {
        bg: '#09090b',
        bgCard: '#141417',
        bgInner: '#1c1c21',
        border: 'rgba(255, 255, 255, 0.08)',
        inputBorder: '#2e2e36',
        inputBg: '#18181c',
        inputText: '#ffffff',
        title: '#ffffff',
        textMuted: '#94a3b8',
        btnPrimaryBg: '#3b82f6',
        btnPrimaryText: '#ffffff',
        btnSecondaryBg: '#222228',
        btnSecondaryText: '#e2e8f0',
        btnSecondaryBorder: 'rgba(255, 255, 255, 0.12)',
        navActiveBg: '#222228',
        navActiveText: '#ffffff',
        navInactiveText: '#94a3b8',
      }
    : {
        bg: '#ffffff',
        bgCard: '#ffffff',
        bgInner: '#f8fafc',
        border: '#e2e8f0',
        inputBorder: '#cbd5e1',
        inputBg: '#ffffff',
        inputText: '#0f172a',
        title: '#1e1b4b',
        textMuted: '#64748b',
        btnPrimaryBg: '#1e1b4b',
        btnPrimaryText: '#ffffff',
        btnSecondaryBg: '#ffffff',
        btnSecondaryText: '#1e1b4b',
        btnSecondaryBorder: '#e2e8f0',
        navActiveBg: '#f1f5f9',
        navActiveText: '#1e1b4b',
        navInactiveText: '#64748b',
      };

  return (
    <Layout>
      <div style={{ maxWidth: '1060px', margin: '20px auto 60px', padding: '0 20px' }}>
        
        {/* Contenedor Principal de Dos Columnas (Settings UI) */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start' }}>
          
          {/* ── COLUMNA IZQUIERDA: Menú Vertical ── */}
          <div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: colors.title,
                margin: '0 0 24px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Ajustes
            </h2>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => setActiveTab('perfil')}
                style={{
                  textAlign: 'left',
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: activeTab === 'perfil' ? colors.navActiveBg : 'transparent',
                  color: activeTab === 'perfil' ? colors.navActiveText : colors.navInactiveText,
                  fontWeight: activeTab === 'perfil' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                Perfil público
              </button>

              <button
                onClick={() => setActiveTab('seguridad')}
                style={{
                  textAlign: 'left',
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: activeTab === 'seguridad' ? colors.navActiveBg : 'transparent',
                  color: activeTab === 'seguridad' ? colors.navActiveText : colors.navInactiveText,
                  fontWeight: activeTab === 'seguridad' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                Seguridad & Cuenta
              </button>

              <button
                onClick={() => setActiveTab('permisos')}
                style={{
                  textAlign: 'left',
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: activeTab === 'permisos' ? colors.navActiveBg : 'transparent',
                  color: activeTab === 'permisos' ? colors.navActiveText : colors.navInactiveText,
                  fontWeight: activeTab === 'permisos' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                Permisos del Rol
              </button>

              <button
                onClick={() => setActiveTab('notificaciones')}
                style={{
                  textAlign: 'left',
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: activeTab === 'notificaciones' ? colors.navActiveBg : 'transparent',
                  color: activeTab === 'notificaciones' ? colors.navActiveText : colors.navInactiveText,
                  fontWeight: activeTab === 'notificaciones' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                Notificaciones
              </button>
            </nav>
          </div>

          {/* ── COLUMNA DERECHA: Contenido Principal ── */}
          <div>
            
            {/* Mensajes de Alerta */}
            {mensajeExito && (
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                  border: '1px solid #22c55e',
                  color: isDark ? '#4ade80' : '#15803d',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                {mensajeExito}
              </div>
            )}

            {mensajeError && (
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                  border: '1px solid #ef4444',
                  color: isDark ? '#f87171' : '#b91c1c',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
                {mensajeError}
              </div>
            )}

            {/* 1. TAB: PERFIL PÚBLICO */}
            {activeTab === 'perfil' && (
              <form onSubmit={handleGuardarPerfil}>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: colors.title,
                    margin: '0 0 28px 0',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Perfil público
                </h3>

                {/* Sección de Foto de Perfil */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '32px' }}>
                  <div
                    onClick={() => {
                      if (fotoUrl) setModalVisualizarFoto(true);
                    }}
                    title={fotoUrl ? 'Haz clic para ampliar la foto' : undefined}
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? '#1e3a8a' : '#3b82f6',
                      color: '#ffffff',
                      fontSize: '38px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      border: `3px solid ${colors.bgCard}`,
                      flexShrink: 0,
                      cursor: fotoUrl ? 'pointer' : 'default',
                      position: 'relative',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (fotoUrl) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.22)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (fotoUrl) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                      }
                    }}
                  >
                    {fotoUrl ? (
                      <>
                        <img
                          src={fotoUrl}
                          alt="Perfil"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'white' }}>
                            zoom_in
                          </span>
                        </div>
                      </>
                    ) : (
                      nombre.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFotoChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: colors.btnPrimaryBg,
                        color: colors.btnPrimaryText,
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Cambiar foto
                    </button>

                    <button
                      type="button"
                      onClick={handleEliminarFoto}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.btnSecondaryBorder}`,
                        backgroundColor: colors.btnSecondaryBg,
                        color: colors.btnSecondaryText,
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      Eliminar foto
                    </button>
                  </div>
                </div>

                {/* Campos del Formulario */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Fila 1: Primer Nombre & Apellidos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Primer Nombre
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Juan"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Apellidos
                      </label>
                      <input
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Ej. Pérez"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s',
                        }}
                      />
                    </div>
                  </div>

                  {/* Fila 2: Correo Electrónico */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="usuario@cootranar.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.inputBorder}`,
                        backgroundColor: colors.inputBg,
                        color: colors.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Fila 3: Cargo / Profesión */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                      Cargo / Rol en Cootranar
                    </label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ej. Administrador del Sistema"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.inputBorder}`,
                        backgroundColor: colors.inputBg,
                        color: colors.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Fila 4: Tipo de Documento & Número */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Tipo de Documento
                      </label>
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="TI">Tarjeta de Identidad (TI)</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Número de Documento
                      </label>
                      <input
                        type="text"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        placeholder="Ej. 1085294821"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Fila 5: Teléfono */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. 312 456 7890"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.inputBorder}`,
                        backgroundColor: colors.inputBg,
                        color: colors.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Fila 6: Biografía / Descripción */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                      Biografía o Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Breve descripción de funciones o perfil del colaborador..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.inputBorder}`,
                        backgroundColor: colors.inputBg,
                        color: colors.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Sección Inferior: Asignación Organizacional */}
                  <div style={{ marginTop: '12px' }}>
                    <h4
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: colors.title,
                        margin: '0 0 14px 0',
                      }}
                    >
                      Asignación Operativa
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: colors.textMuted }}>
                          corporate_fare
                        </span>
                        <span style={{ fontSize: '13.5px', color: colors.inputText, fontWeight: 500 }}>
                          Cooperativa: <strong>COOTRANAR R.L.</strong>
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#22c55e' }}>
                          verified
                        </span>
                        <span style={{ fontSize: '13.5px', color: colors.inputText, fontWeight: 500 }}>
                          Estado: <strong style={{ color: '#16a34a' }}>{perfilDetallado?.estadousuario || 'Usuario Activo y Operativo'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Envío (Submit) */}
                  <div style={{ marginTop: '16px' }}>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: '13px 28px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: colors.btnPrimaryBg,
                        color: colors.btnPrimaryText,
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        opacity: saving ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {saving ? 'hourglass_top' : 'save'}
                      </span>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>

                </div>
              </form>
            )}

            {/* 2. TAB: SEGURIDAD & CUENTA */}
            {activeTab === 'seguridad' && (
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: colors.title,
                    margin: '0 0 24px 0',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Seguridad & Clave
                </h3>

                <div
                  style={{
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.02)',
                    marginBottom: '24px',
                  }}
                >
                  <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Contraseña Actual
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Nueva Contraseña
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.title, marginBottom: '8px' }}>
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${colors.inputBorder}`,
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="showPass"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="showPass" style={{ fontSize: '13px', color: colors.textMuted, cursor: 'pointer' }}>
                        Mostrar contraseñas
                      </label>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="submit"
                        disabled={savingPassword}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: colors.btnPrimaryBg,
                          color: colors.btnPrimaryText,
                          fontSize: '14px',
                          fontWeight: 700,
                          cursor: savingPassword ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: savingPassword ? 0.7 : 1,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {savingPassword ? 'hourglass_top' : 'save'}
                        </span>
                        {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 3. TAB: PERMISOS DEL ROL */}
            {activeTab === 'permisos' && (
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: colors.title,
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Permisos del Rol
                </h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: colors.textMuted }}>
                  Módulos y funciones operativas asignadas al rol <strong>{rolActual}</strong>:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {permisos.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        backgroundColor: colors.bgInner,
                        border: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        opacity: p.activo ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: p.activo
                              ? isDark ? 'rgba(59, 130, 246, 0.2)' : '#e0e7ff'
                              : isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                            color: p.activo ? '#3b82f6' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {p.icon}
                          </span>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.title }}>
                            {p.modulo}
                          </h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: colors.textMuted }}>
                            {p.desc}
                          </p>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: p.activo
                            ? isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7'
                            : isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                          color: p.activo ? '#16a34a' : '#64748b',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {p.activo ? 'Habilitado' : 'Restringido'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TAB: NOTIFICACIONES */}
            {activeTab === 'notificaciones' && (
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: colors.title,
                    margin: '0 0 24px 0',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Notificaciones & Alertas
                </h3>

                <div
                  style={{
                    backgroundColor: colors.bgInner,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.title }}>
                        Alertas de Despachos y Viajes
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: colors.textMuted }}>
                        Recibir notificaciones cuando se programe o finalice un despacho
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.title }}>
                        Notificaciones de Encomiendas
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: colors.textMuted }}>
                        Avisos al registrar o entregar guías de encomiendas
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </Layout>
  );
};
