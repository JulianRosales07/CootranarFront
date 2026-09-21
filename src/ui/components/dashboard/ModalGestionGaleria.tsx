import React, { useEffect, useRef, useState } from 'react';
import {
  type FotoCootranar,
  FOTOS_PREDETERMINADAS,
  CUPO_APROXIMADO_BYTES,
  comprimirImagen,
  formatearPeso,
  pesoAproximado,
  reordenar,
} from './galeriaBanner';

interface Props {
  fotos: FotoCootranar[];
  /** Abre directamente el formulario de una foto nueva. */
  abrirEnFormulario?: boolean;
  onGuardar: (fotos: FotoCootranar[]) => void;
  onClose: () => void;
}

type Vista = 'lista' | 'formulario';

const label: React.CSSProperties = {
  display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em',
};

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px',
  outline: 'none', fontFamily: 'inherit', background: 'white', color: '#0f172a',
};

const botonPrimario: React.CSSProperties = {
  background: '#0D3B8E', color: 'white', border: 'none', borderRadius: '7px',
  padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '6px',
};

const botonSecundario: React.CSSProperties = {
  background: 'white', color: '#64748b', border: '1px solid #cbd5e1',
  borderRadius: '7px', padding: '8px 14px', fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
};

const botonMini = (deshabilitado = false): React.CSSProperties => ({
  width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #cbd5e1',
  background: 'white', color: deshabilitado ? '#cbd5e1' : '#475569',
  cursor: deshabilitado ? 'not-allowed' : 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
});

const FORM_VACIO = { url: '', titulo: '', descripcion: '', tag: '', icono: 'photo_camera' };

export const ModalGestionGaleria: React.FC<Props> = ({ fotos, abrirEnFormulario = false, onGuardar, onClose }) => {
  const [borrador, setBorrador] = useState<FotoCootranar[]>(() => [...fotos]);
  const [vista, setVista] = useState<Vista>(abrirEnFormulario ? 'formulario' : 'lista');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const peso = pesoAproximado(borrador);
  const porcentajeCupo = Math.min(Math.round((peso / CUPO_APROXIMADO_BYTES) * 100), 100);

  // ── Reordenar ──────────────────────────────────────────────────────────────
  const mover = (desde: number, hasta: number) => {
    if (hasta < 0 || hasta >= borrador.length) return;
    setBorrador(prev => reordenar(prev, desde, hasta));
  };

  // ── Formulario ─────────────────────────────────────────────────────────────
  const abrirNueva = () => {
    setEditandoId(null);
    setForm({ ...FORM_VACIO });
    setError(null);
    setVista('formulario');
  };

  const abrirEdicion = (foto: FotoCootranar) => {
    setEditandoId(foto.id);
    setForm({
      url: foto.url,
      titulo: foto.titulo,
      descripcion: foto.descripcion,
      tag: foto.tag,
      icono: foto.icono || 'photo_camera',
    });
    setError(null);
    setVista('formulario');
  };

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesando(true);
    setError(null);
    try {
      // Se redimensiona antes de guardar: una foto de cámara en base64 llena el cupo
      const dataUrl = await comprimirImagen(file);
      setForm(prev => ({ ...prev, url: dataUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la imagen.');
    } finally {
      setProcesando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmarFormulario = () => {
    if (!form.url) {
      setError('Selecciona una imagen para la galería.');
      return;
    }
    if (!form.titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    const datos = {
      url: form.url,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || 'Fotografía de la flota y servicio Cootranar.',
      tag: form.tag.trim() || 'Flota Cootranar',
      icono: form.icono.trim() || 'photo_camera',
    };

    if (editandoId) {
      setBorrador(prev => prev.map(f => (f.id === editandoId ? { ...f, ...datos } : f)));
    } else {
      setBorrador(prev => [...prev, { id: `foto-${Date.now()}`, ...datos, esPersonalizada: true }]);
    }

    setVista('lista');
    setEditandoId(null);
    setForm({ ...FORM_VACIO });
    setError(null);
  };

  const eliminar = (foto: FotoCootranar) => {
    if (borrador.length <= 1) {
      setError('La galería debe tener al menos una foto.');
      return;
    }
    if (!window.confirm(`¿Quitar "${foto.titulo}" de la galería?`)) return;
    setBorrador(prev => prev.filter(f => f.id !== foto.id));
    setError(null);
  };

  const restablecer = () => {
    if (!window.confirm('¿Restablecer las fotos originales de Cootranar? Se perderán las que hayas agregado.')) return;
    setBorrador([...FOTOS_PREDETERMINADAS]);
    setError(null);
  };

  const hayCambios = JSON.stringify(borrador) !== JSON.stringify(fotos);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Administrar galería del banner"
        style={{
          background: 'white', borderRadius: '14px', width: '100%', maxWidth: '640px',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 20px 35px -10px rgba(0,0,0,0.25)',
        }}
      >
        {/* Encabezado */}
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span className="material-symbols-outlined" style={{ color: '#0D3B8E', fontSize: '22px' }}>
              {vista === 'lista' ? 'collections' : editandoId ? 'edit' : 'add_photo_alternate'}
            </span>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {vista === 'lista'
                  ? 'Administrar galería del banner'
                  : editandoId ? 'Editar foto' : 'Agregar foto'}
              </h4>
              {vista === 'lista' && (
                <p style={{ margin: '1px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                  Arrastra para cambiar el orden en que se muestran
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '9px',
              padding: '10px 12px', marginBottom: '14px', display: 'flex', gap: '8px',
              color: '#b91c1c', fontSize: '12.5px', fontWeight: 600,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── LISTA ── */}
          {vista === 'lista' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {borrador.map((foto, i) => (
                  <div
                    key={foto.id}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData('text/plain', String(i)); setArrastrando(i); }}
                    onDragEnd={() => setArrastrando(null)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const desde = Number(e.dataTransfer.getData('text/plain'));
                      if (Number.isInteger(desde)) mover(desde, i);
                      setArrastrando(null);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '11px', padding: '9px',
                      border: `1px solid ${arrastrando === i ? '#0D3B8E' : '#e2e8f0'}`,
                      borderRadius: '10px', background: '#f8fafc',
                      opacity: arrastrando === i ? 0.6 : 1, cursor: 'grab',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      title="Arrastrar para reordenar"
                      style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0 }}
                    >
                      drag_indicator
                    </span>

                    <span style={{
                      width: '22px', height: '22px', borderRadius: '6px', background: '#0D3B8E',
                      color: 'white', fontSize: '11px', fontWeight: 800, flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i + 1}
                    </span>

                    <img
                      src={foto.url}
                      alt={foto.titulo}
                      style={{
                        width: '64px', height: '42px', objectFit: 'cover', borderRadius: '6px',
                        border: '1px solid #e2e8f0', flexShrink: 0, background: '#e2e8f0',
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {foto.titulo}
                      </p>
                      <p style={{
                        margin: '1px 0 0', fontSize: '11.5px', color: '#64748b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {foto.tag}
                        {foto.esPersonalizada && (
                          <span style={{
                            marginLeft: '7px', padding: '1px 6px', borderRadius: '999px',
                            background: '#dcfce7', color: '#15803d', fontSize: '9.5px',
                            fontWeight: 800, textTransform: 'uppercase',
                          }}>
                            Propia
                          </span>
                        )}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={() => mover(i, i - 1)}
                        disabled={i === 0}
                        title="Subir"
                        aria-label={`Subir ${foto.titulo}`}
                        style={botonMini(i === 0)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>keyboard_arrow_up</span>
                      </button>
                      <button
                        onClick={() => mover(i, i + 1)}
                        disabled={i === borrador.length - 1}
                        title="Bajar"
                        aria-label={`Bajar ${foto.titulo}`}
                        style={botonMini(i === borrador.length - 1)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                      </button>
                      <button
                        onClick={() => abrirEdicion(foto)}
                        title="Editar"
                        aria-label={`Editar ${foto.titulo}`}
                        style={{ ...botonMini(), color: '#0D3B8E' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                      </button>
                      <button
                        onClick={() => eliminar(foto)}
                        title="Quitar de la galería"
                        aria-label={`Quitar ${foto.titulo}`}
                        style={{ ...botonMini(), color: '#b91c1c', borderColor: '#fca5a5' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={abrirNueva} style={{ ...botonSecundario, width: '100%', justifyContent: 'center', color: '#0D3B8E', borderColor: '#bfdbfe' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_photo_alternate</span>
                Agregar foto
              </button>

              {/* Uso de almacenamiento del navegador */}
              <div style={{ marginTop: '16px', padding: '11px 13px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Espacio usado en este navegador</span>
                  <span>{formatearPeso(peso)} de ~{formatearPeso(CUPO_APROXIMADO_BYTES)}</span>
                </div>
                <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${porcentajeCupo}%`, height: '100%', borderRadius: '999px',
                    background: porcentajeCupo > 80 ? '#ef4444' : porcentajeCupo > 60 ? '#f59e0b' : '#22c55e',
                  }} />
                </div>
                <p style={{ margin: '7px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                  La galería se guarda en este navegador, así que otros administradores no verán estas fotos.
                </p>
              </div>
            </>
          )}

          {/* ── FORMULARIO ── */}
          {vista === 'formulario' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={label} htmlFor="gal-archivo">Fotografía *</label>
                <input
                  id="gal-archivo"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleArchivo}
                  style={{ display: 'none' }}
                />

                {form.url ? (
                  <div style={{ position: 'relative', width: '100%', height: '170px', borderRadius: '9px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={form.url} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={procesando}
                      style={{
                        position: 'absolute', bottom: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none',
                        borderRadius: '6px', padding: '5px 10px', fontSize: '11px',
                        fontWeight: 600, cursor: procesando ? 'wait' : 'pointer',
                      }}
                    >
                      {procesando ? 'Procesando…' : 'Cambiar foto'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={procesando}
                    style={{
                      width: '100%', border: '2px dashed #cbd5e1', borderRadius: '10px',
                      padding: '26px 16px', textAlign: 'center', cursor: procesando ? 'wait' : 'pointer',
                      background: '#f8fafc', fontFamily: 'inherit',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '34px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      cloud_upload
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D3B8E' }}>
                      {procesando ? 'Procesando imagen…' : 'Haz clic para seleccionar una foto'}
                    </span>
                    <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0' }}>
                      JPG, PNG o WebP. Se redimensiona a 1600px para ahorrar espacio.
                    </p>
                  </button>
                )}
              </div>

              <div>
                <label style={label} htmlFor="gal-titulo">Título *</label>
                <input
                  id="gal-titulo"
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej. Bus 1888 en Terminal de Pasto"
                  style={input}
                />
              </div>

              <div>
                <label style={label} htmlFor="gal-desc">Descripción</label>
                <input
                  id="gal-desc"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej. Nueva unidad asignada a la ruta Pasto - Cali."
                  style={input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '13px' }}>
                <div>
                  <label style={label} htmlFor="gal-tag">Etiqueta</label>
                  <input
                    id="gal-tag"
                    value={form.tag}
                    onChange={e => setForm({ ...form, tag: e.target.value })}
                    placeholder="Ej. Nueva Flota"
                    style={input}
                  />
                </div>
                <div>
                  <label style={label} htmlFor="gal-icono">Icono</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      id="gal-icono"
                      value={form.icono}
                      onChange={e => setForm({ ...form, icono: e.target.value })}
                      placeholder="photo_camera"
                      style={input}
                    />
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#0D3B8E' }}>
                      {form.icono || 'photo_camera'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div style={{
          padding: '13px 22px', borderTop: '1px solid #f1f5f9', background: '#f8fafc',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        }}>
          {vista === 'lista' ? (
            <>
              <button type="button" onClick={restablecer} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Restablecer fotos originales
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={onClose} style={botonSecundario}>Cancelar</button>
                <button
                  type="button"
                  onClick={() => onGuardar(borrador)}
                  disabled={!hayCambios}
                  style={{ ...botonPrimario, opacity: hayCambios ? 1 : 0.5, cursor: hayCambios ? 'pointer' : 'not-allowed' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>save</span>
                  Guardar cambios
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setVista('lista'); setError(null); setEditandoId(null); }}
                style={botonSecundario}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>arrow_back</span>
                Volver a la lista
              </button>
              <button type="button" onClick={confirmarFormulario} disabled={procesando} style={{ ...botonPrimario, opacity: procesando ? 0.6 : 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>check</span>
                {editandoId ? 'Aplicar cambios' : 'Agregar a la galería'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalGestionGaleria;
