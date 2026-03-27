import React, { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useConductores } from '../../hooks/useConductores';
import type { Conductor, EstadoConductor } from '../../../domain/entities/Conductor';
import { httpClient } from '../../../infrastructure/api/httpClient';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 5;

/* ─── Avatar helper ───────────────────────────────────────── */
const AVATAR_COLORS = [
  ['#dbeafe', '#1d4ed8'],
  ['#dcfce7', '#15803d'],
  ['#fce7f3', '#be185d'],
  ['#fef9c3', '#a16207'],
  ['#ede9fe', '#7c3aed'],
];
function Avatar({ nombre, apellido, index }: { nombre: string; apellido: string; index: number }) {
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '32px', height: '32px', borderRadius: '50%',
      background: bg, color: fg, fontSize: '12px', fontWeight: 700,
      flexShrink: 0,
    }}>
      {initials}
    </span>
  );
}

/* ─── Status badge ────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    ACTIVO:    { bg: '#dcfce7', color: '#15803d' },
    INACTIVO:  { bg: '#f1f5f9', color: '#64748b' },
    SUSPENDIDO:{ bg: '#fee2e2', color: '#dc2626' },
  };
  const { bg, color } = map[estado] ?? { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: '20px',
      background: bg, color, fontSize: '11.5px', fontWeight: 700,
    }}>
      {estado}
    </span>
  );
}

/* ─── Pagination helpers ──────────────────────────────────── */
function PagBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      minWidth: '30px', height: '30px', padding: '0 6px',
      border: `1px solid ${active ? BLUE : '#e2e8f0'}`,
      borderRadius: '6px',
      background: active ? BLUE : 'white',
      color: active ? 'white' : '#475569',
      fontSize: '13px', fontWeight: active ? 700 : 400,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    }}>
      {label}
    </button>
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

/* ─── Small input helper ──────────────────────────────────── */
function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: '6px',
      }}>{label}</label>
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

const inputWithIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '34px',
};

/* ═══════════════════════════════════════════════════════════ */
export const ConductoresPage = () => {
  const { conductores, isLoading, create, update, remove } = useConductores();

  /* ── form state ──────────────────────────────────────────── */
  const [nombre, setNombre]                     = useState('');
  const [apellido, setApellido]                 = useState('');
  const [tipoDoc, setTipoDoc]                   = useState('CC');
  const [documento, setDocumento]               = useState('');
  const [email, setEmail]                       = useState('');
  const [telefono, setTelefono]                 = useState('');
  const [licencia, setLicencia]                 = useState('');
  const [categoriaLicencia, setCategoriaLicencia] = useState('');
  const [vencimientoLicencia, setVencimientoLicencia] = useState('');
  const [fechaContratacion, setFechaContratacion] = useState('');
  const [estado, setEstado]                     = useState<EstadoConductor>('ACTIVO');
  const [archivoLicencia, setArchivoLicencia]   = useState<File | null>(null);
  const [editingId, setEditingId]               = useState<string | null>(null);
  const [editingUsuarioId, setEditingUsuarioId] = useState<number | null>(null);
  const [formMsg, setFormMsg]                   = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ── table state ─────────────────────────────────────────── */
  const [page, setPage]                 = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  /* ── derived list ────────────────────────────────────────── */
  const list = useMemo(() => {
    const arr = Array.isArray(conductores) ? conductores : [];
    if (filterEstado === 'TODOS') return arr;
    return arr.filter((c) => c.estado === filterEstado);
  }, [conductores, filterEstado]);

  const totalPages  = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const paginated   = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const visiblePages = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  })();

  /* ── handlers ────────────────────────────────────────────── */
  const resetForm = () => {
    setNombre(''); setApellido(''); setTipoDoc('CC'); setDocumento('');
    setEmail(''); setTelefono(''); setLicencia(''); setCategoriaLicencia('');
    setVencimientoLicencia(''); setFechaContratacion(''); setEstado('ACTIVO');
    setArchivoLicencia(null);
    setEditingId(null);
    setEditingUsuarioId(null);
  };

  const startEdit = (c: Conductor) => {
    setEditingId(c.id);
    setEditingUsuarioId(c.idusuario ?? null);
    setNombre(c.nombre);
    setApellido(c.apellido);
    setTipoDoc(c.tipoDocumento ?? 'CC');
    setDocumento(c.documento);
    setEmail(c.email ?? '');
    setTelefono(c.telefono);
    setLicencia(c.licencia);
    setCategoriaLicencia(c.categoriaLicencia ?? '');
    // Convertir fechas ISO a formato yyyy-MM-dd
    setVencimientoLicencia(c.vencimientoLicencia ? c.vencimientoLicencia.split('T')[0] : '');
    setFechaContratacion(c.fechaContratacion ? c.fechaContratacion.split('T')[0] : '');
    setEstado(c.estado);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !documento.trim()) {
      setFormMsg({ type: 'err', text: 'Nombre, apellido y documento son requeridos.' });
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('documento', documento);
    formData.append('tipodocumento', tipoDoc);
    formData.append('numerolicencia', licencia);
    formData.append('categorialicencia', categoriaLicencia);
    formData.append('fechavencimientolicencia', vencimientoLicencia);
    formData.append('telefono', telefono);
    formData.append('correoelectronico', email);
    formData.append('email', email); // Para asegurar que el backend reciba el email
    formData.append('correo', email);
    formData.append('fechacontratacion', fechaContratacion);
    formData.append('estado', estado);
    
    if (archivoLicencia) {
      formData.append('licencia', archivoLicencia);
    }

    if (editingId && editingUsuarioId) {
      update.mutate(
        { id: String(editingUsuarioId), data: formData },
        {
          onSuccess: () => { setFormMsg({ type: 'ok', text: 'Conductor actualizado.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
          onError:   (error: any) => { 
            const msg = error?.response?.data?.message || 'Error al actualizar conductor.';
            setFormMsg({ type: 'err', text: msg }); 
            setTimeout(() => setFormMsg(null), 3000); 
          },
        }
      );
    } else {
      create.mutate(formData as any, {
        onSuccess: () => { setFormMsg({ type: 'ok', text: 'Conductor guardado correctamente.' }); resetForm(); setTimeout(() => setFormMsg(null), 3000); },
        onError:   (error: any) => { 
          const msg = error?.response?.data?.message || 'Error al guardar conductor.';
          setFormMsg({ type: 'err', text: msg }); 
          setTimeout(() => setFormMsg(null), 3000); 
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este conductor?')) {
      remove.mutate(id);
    }
  };

  const handleDownload = async (conductor: Conductor) => {
    const publicUrl = conductor.urlLicencia;
    if (!publicUrl) {
      alert(`No hay licencia registrada (archivo) para ${conductor.nombre}. publicUrl es nulo.`);
      return;
    }

    try {
      const response = await httpClient.get(`/archivos/url-firmada`, { params: { url: publicUrl } });
      const signedUrl = response.data?.data?.url;
      
      if (signedUrl) {
        const opened = window.open(signedUrl, '_blank');
        if (!opened) {
          alert('El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.');
        }
      } else {
        alert(`No se pudo extraer la URL firmada de la respuesta: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      console.error('Error al descargar archivo:', error);
      alert(`Error al intentar descargar la licencia: ${error?.response?.data?.message || error.message}`);
    }
  };

  /* ── focus / blur helpers ────────────────────────────────── */
  const focusBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#93b4e0');
  const blurBorder   = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#e2e8f0');

  /* ── section divider ─────────────────────────────────────── */
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '16px' }}>
      {children}
    </div>
  );

  return (
    <Layout>
      {/* ── Add / Edit form card ───────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2', padding: '20px 24px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px',
      }}>
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: BLUE }}>
            person_add
          </span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            {editingId ? 'Editar Conductor' : 'Añadir Nuevo Conductor'}
          </span>
        </div>

        <form onSubmit={handleGuardar}>
          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

            {/* ── LEFT: Datos Personales ──────────────────── */}
            <div>
              <SectionTitle>Datos Personales</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Nombre">
                  <input
                    value={nombre} onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Carlos"
                    style={inputStyle}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>
                <Field label="Apellido">
                  <input
                    value={apellido} onChange={e => setApellido(e.target.value)}
                    placeholder="Ej. Rodríguez"
                    style={inputStyle}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px', marginTop: '14px' }}>
                <Field label="Tipo Doc.">
                  <select
                    value={tipoDoc} onChange={e => setTipoDoc(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={focusBorder} onBlur={blurBorder}
                  >
                    {['CC', 'CE', 'TI', 'PP'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Número Documento">
                  <input
                    value={documento} onChange={e => setDocumento(e.target.value)}
                    placeholder="Ej. 1085332123"
                    style={inputStyle}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>
              </div>

              <div style={{ marginTop: '14px' }}>
                <Field label="Correo Electrónico">
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '16px', color: '#cbd5e1',
                    }}>mail</span>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      style={inputWithIconStyle}
                      onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </div>
                </Field>
              </div>

              <div style={{ marginTop: '14px' }}>
                <Field label="Teléfono">
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '16px', color: '#cbd5e1',
                    }}>call</span>
                    <input
                      value={telefono} onChange={e => setTelefono(e.target.value)}
                      placeholder="300 123 4567"
                      style={inputWithIconStyle}
                      onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* ── RIGHT: Datos de Licencia y Contrato ────── */}
            <div>
              <SectionTitle>Datos de Licencia y Contrato</SectionTitle>

              <Field label="Número de Licencia">
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', color: '#cbd5e1',
                  }}>badge</span>
                  <input
                    value={licencia} onChange={e => setLicencia(e.target.value)}
                    placeholder="Ej. 7894561230"
                    style={inputWithIconStyle}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <Field label="Categoría Licencia">
                  <select
                    value={categoriaLicencia} 
                    onChange={e => setCategoriaLicencia(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={focusBorder} 
                    onBlur={blurBorder}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="C1">C1 - Automóviles, camperos, camionetas y microbuses</option>
                    <option value="C2">C2 - Camiones rígidos, busetas y buses</option>
                    <option value="C3">C3 - Vehículos articulados</option>
                  </select>
                </Field>
                <Field label="Vencimiento Licencia">
                  <input
                    type="date" value={vencimientoLicencia} onChange={e => setVencimientoLicencia(e.target.value)}
                    style={inputStyle}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>
              </div>

              <div style={{ marginTop: '14px' }}>
                <Field label="Archivo de Licencia (PDF/Imagen)">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={e => setArchivoLicencia(e.target.files?.[0] || null)}
                      style={{
                        ...inputStyle,
                        paddingLeft: '34px',
                        cursor: 'pointer',
                      }}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '16px', color: '#cbd5e1', pointerEvents: 'none',
                    }}>upload_file</span>
                  </div>
                  {archivoLicencia && (
                    <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                      ✓ {archivoLicencia.name}
                    </p>
                  )}
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <Field label="Fecha Contratación">
                  <input
                    type="date" value={fechaContratacion} onChange={e => setFechaContratacion(e.target.value)}
                    style={inputStyle}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>
                <Field label="Estado">
                  <select
                    value={estado} onChange={e => setEstado(e.target.value as EstadoConductor)}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={focusBorder} onBlur={blurBorder}
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="SUSPENDIDO">SUSPENDIDO</option>
                  </select>
                </Field>
              </div>

              {/* Save button */}
              <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'white', color: '#64748b',
                    border: '1px solid #cbd5e1', borderRadius: '7px',
                    padding: '10px 16px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                    Cancelar
                  </button>
                )}
                <button type="submit" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: BLUE, color: 'white',
                  border: 'none', borderRadius: '7px',
                  padding: '10px 20px', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#0a2f72')}
                  onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {editingId ? 'edit' : 'save'}
                  </span>
                  {editingId ? 'Actualizar Conductor' : 'Guardar Conductor'}
                </button>
              </div>

              {formMsg && (
                <p style={{
                  marginTop: '10px', fontSize: '13px', fontWeight: 600,
                  color: formMsg.type === 'ok' ? '#16a34a' : '#dc2626',
                  textAlign: 'right',
                }}>
                  {formMsg.text}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ── Table card ────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #e8edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
        }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            Conductores Registrados
          </span>

          {/* Estado filter dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={filterEstado}
              onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
              style={{
                padding: '7px 32px 7px 12px',
                border: '1px solid #e2e8f0', borderRadius: '7px',
                background: 'white', color: '#475569',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                appearance: 'none', outline: 'none',
              }}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', color: '#94a3b8', pointerEvents: 'none',
            }}>expand_more</span>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              hourglass_empty
            </span>
            <span style={{ fontSize: '13px' }}>Cargando conductores...</span>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'ID',                 width: '70px'  },
                    { label: 'Nombre Completo',    width: '200px' },
                    { label: 'Documento',          width: '130px' },
                    { label: 'Categoría Licencia', width: '130px' },
                    { label: 'Fecha Vencimiento',  width: '140px' },
                    { label: 'Estado',             width: '110px' },
                    { label: 'Acciones',           width: '90px'  },
                  ].map(({ label, width }) => (
                    <th key={label} style={{
                      width, padding: '11px 16px',
                      textAlign: 'left', fontSize: '10.5px', fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '1px solid #e8edf2', background: '#f8fafc',
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '48px', textAlign: 'center',
                      color: '#94a3b8', fontSize: '13px',
                    }}>
                      No se encontraron conductores.
                    </td>
                  </tr>
                ) : (
                  paginated.map((conductor, idx) => {
                    const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx;
                    // Format vencimiento date nicely
                    const venc = conductor.vencimientoLicencia
                      ? new Date(conductor.vencimientoLicencia).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr
                        key={conductor.id}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        {/* ID */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                          {conductor.id}
                        </td>

                        {/* Name + avatar */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar nombre={conductor.nombre} apellido={conductor.apellido} index={globalIdx} />
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                                {conductor.nombre} {conductor.apellido}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Documento */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                          {conductor.documento
                            ? conductor.documento.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : '—'}
                        </td>

                        {/* Categoría licencia */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                          {conductor.categoriaLicencia || conductor.licencia || '—'}
                        </td>

                        {/* Fecha vencimiento */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                          {venc}
                        </td>

                        {/* Estado badge */}
                        <td style={{ padding: '12px 16px' }}>
                          <EstadoBadge estado={conductor.estado} />
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                              title="Descargar"
                              onClick={() => handleDownload(conductor)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                            </button>
                            <button
                              title="Editar"
                              onClick={() => startEdit(conductor)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            </button>
                            <button
                              title="Eliminar"
                              onClick={() => handleDelete(conductor.id)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', color: '#94a3b8',
                                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Footer / Pagination */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 20px', borderTop: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Mostrando{' '}
                <strong style={{ color: '#475569' }}>
                  {list.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}
                </strong>{' '}
                a{' '}
                <strong style={{ color: '#475569' }}>
                  {Math.min(page * ITEMS_PER_PAGE, list.length)}
                </strong>{' '}
                de{' '}
                <strong style={{ color: '#475569' }}>{list.length}</strong>{' '}
                conductores
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <NavArrow icon="chevron_left" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                {visiblePages.map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '13px' }}>
                      ...
                    </span>
                  ) : (
                    <PagBtn
                      key={p}
                      label={String(p)}
                      active={p === page}
                      onClick={() => setPage(p as number)}
                    />
                  )
                )}
                <NavArrow icon="chevron_right" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
