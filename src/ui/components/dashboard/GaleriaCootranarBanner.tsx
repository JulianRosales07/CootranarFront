import React, { useState, useEffect, useRef } from 'react';
import busExterior from '../../../assets/BusCootranar.jpg';
import heroBanner from '../../../assets/cootranar_hero.png';

interface FotoCootranar {
  id: string;
  url: string;
  titulo: string;
  descripcion: string;
  tag: string;
  icono: string;
  esPersonalizada?: boolean;
}

const FOTOS_PREDETERMINADAS: FotoCootranar[] = [
  {
    id: '1',
    url: busExterior,
    titulo: 'Flota Moderna de Pasajeros',
    descripcion: 'Unidades de última tecnología con monitoreo satelital en tiempo real.',
    tag: 'Transporte Intermunicipal',
    icono: 'directions_bus',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Confort y Seguridad en Ruta',
    descripcion: 'Cabinas climatizadas, silletería ergonómica reclinable y entretenimiento a bordo.',
    tag: 'Experiencia VIP',
    icono: 'airline_seat_recline_extra',
  },
  {
    id: '3',
    url: heroBanner,
    titulo: 'Servicio Especializado de Encomiendas',
    descripcion: 'Puntos de recepción directa en agencias y terminales con despacho diario.',
    tag: 'Carga & Paquetería',
    icono: 'local_shipping',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Red de Conexión Regional',
    descripcion: 'Más de 50 rutas estratégicas conectando Nariño, Valle del Cauca y el Suroccidente.',
    tag: 'Cobertura Nacional',
    icono: 'hub',
  },
];

const STORAGE_KEY = 'cootranar_dashboard_banner_photos';

export const GaleriaCootranarBanner: React.FC = () => {
  const [fotos, setFotos] = useState<FotoCootranar[]>(() => {
    try {
      const guardadas = localStorage.getItem(STORAGE_KEY);
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignorar error de parsing
    }
    return FOTOS_PREDETERMINADAS;
  });

  const [indiceActual, setIndiceActual] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [mostrarModalSubir, setMostrarModalSubir] = useState(false);
  const [nuevaFotoTitulo, setNuevaFotoTitulo] = useState('');
  const [nuevaFotoDesc, setNuevaFotoDesc] = useState('');
  const [nuevaFotoTag, setNuevaFotoTag] = useState('');
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guardar en localStorage cuando cambie el arreglo de fotos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fotos));
    } catch {
      // Error al guardar
    }
  }, [fotos]);

  // Autoplay cada 5.5 segundos
  useEffect(() => {
    if (!autoPlay || fotos.length <= 1) return;

    const timer = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % fotos.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [autoPlay, fotos.length]);

  const fotoActual = fotos[indiceActual] || fotos[0];

  const handleAnterior = () => {
    setIndiceActual((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  const handleSiguiente = () => {
    setIndiceActual((prev) => (prev + 1) % fotos.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNuevaFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarNuevaFoto = () => {
    if (!nuevaFotoUrl) {
      alert('Por favor selecciona una imagen.');
      return;
    }

    const nueva: FotoCootranar = {
      id: Date.now().toString(),
      url: nuevaFotoUrl,
      titulo: nuevaFotoTitulo.trim() || 'Operaciones Cootranar',
      descripcion: nuevaFotoDesc.trim() || 'Fotografía de la flota y servicio Cootranar.',
      tag: nuevaFotoTag.trim() || 'Flota Cootranar',
      icono: 'photo_camera',
      esPersonalizada: true,
    };

    const actualizadas = [nueva, ...fotos];
    setFotos(actualizadas);
    setIndiceActual(0);
    setMostrarModalSubir(false);
    setNuevaFotoUrl('');
    setNuevaFotoTitulo('');
    setNuevaFotoDesc('');
    setNuevaFotoTag('');
  };

  const handleEliminarFotoActual = (id: string) => {
    if (fotos.length <= 1) {
      alert('Debe haber al menos una foto en la galería.');
      return;
    }
    const filtradas = fotos.filter((f) => f.id !== id);
    setFotos(filtradas);
    setIndiceActual(0);
  };

  const handleRestablecerPredeterminadas = () => {
    if (window.confirm('¿Deseas restablecer las fotos predeterminadas de Cootranar?')) {
      setFotos(FOTOS_PREDETERMINADAS);
      setIndiceActual(0);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        marginBottom: '6px',
        backgroundColor: '#0f172a',
      }}
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Contenedor de la Imagen con Aspect Ratio Panorámico */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '210px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Imagen de fondo */}
        <img
          key={fotoActual.id}
          src={fotoActual.url}
          alt={fotoActual.titulo}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            filter: 'brightness(0.85) contrast(1.08)',
            transform: 'scale(1.02)',
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
          }}
        />

        {/* Gradientes cinematográficos */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(13, 27, 62, 0.92) 0%, rgba(13, 59, 142, 0.62) 45%, rgba(0, 0, 0, 0.25) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(0deg, rgba(10, 15, 30, 0.75) 0%, transparent 60%)',
          }}
        />

        {/* Contenido Superpuesto */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '22px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 10,
            boxSizing: 'border-box',
          }}
        >
          {/* Top Bar: Tag y Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#60a5fa' }}>
                  {fotoActual.icono || 'verified'}
                </span>
                <span>{fotoActual.tag}</span>
              </span>

              <span
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(6px)',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {indiceActual + 1} / {fotos.length}
              </span>
            </div>

            {/* Acciones de Galería */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {fotoActual.esPersonalizada && (
                <button
                  onClick={() => handleEliminarFotoActual(fotoActual.id)}
                  title="Eliminar esta foto personalizada"
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                  <span>Eliminar</span>
                </button>
              )}

              <button
                onClick={() => setMostrarModalSubir(true)}
                title="Subir nueva foto de Cootranar"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_photo_alternate</span>
                <span>Agregar Foto</span>
              </button>
            </div>
          </div>

          {/* Bottom Content: Título, Descripción y Controles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ maxWidth: '650px' }}>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '19px',
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  lineHeight: 1.25,
                }}
              >
                {fotoActual.titulo}
              </h3>
              <p
                style={{
                  color: '#e2e8f0',
                  fontSize: '12.5px',
                  fontWeight: 400,
                  margin: '3px 0 0 0',
                  lineHeight: 1.4,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                }}
              >
                {fotoActual.descripcion}
              </p>
            </div>

            {/* Controles de Navegación & Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Dots */}
              <div style={{ display: 'flex', gap: '6px', marginRight: '4px' }}>
                {fotos.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setIndiceActual(i)}
                    title={`Ir a ${f.titulo}`}
                    style={{
                      width: i === indiceActual ? '22px' : '7px',
                      height: '7px',
                      borderRadius: '4px',
                      background: i === indiceActual ? '#60a5fa' : 'rgba(255, 255, 255, 0.35)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
              </div>

              {/* Botón Anterior */}
              <button
                onClick={handleAnterior}
                title="Foto anterior"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>chevron_left</span>
              </button>

              {/* Botón Siguiente */}
              <button
                onClick={handleSiguiente}
                title="Foto siguiente"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Agregar Nueva Foto */}
      {mostrarModalSubir && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMostrarModalSubir(false);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#0D3B8E', fontSize: '22px' }}>
                  add_photo_alternate
                </span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Agregar Foto a la Galería
                </h4>
              </div>
              <button
                onClick={() => setMostrarModalSubir(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* File input / Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Fotografía de Cootranar *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {nuevaFotoUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img
                      src={nuevaFotoUrl}
                      alt="Vista previa"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0D3B8E')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      cloud_upload
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D3B8E' }}>
                      Haz clic para seleccionar una foto
                    </span>
                    <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0' }}>
                      Formatos JPG, PNG o WebP (máx. 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Título */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Título / Identificador
                </label>
                <input
                  type="text"
                  value={nuevaFotoTitulo}
                  onChange={(e) => setNuevaFotoTitulo(e.target.value)}
                  placeholder="Ej. Bus 1888 en Terminal de Pasto"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Descripción breve
                </label>
                <input
                  type="text"
                  value={nuevaFotoDesc}
                  onChange={(e) => setNuevaFotoDesc(e.target.value)}
                  placeholder="Ej. Nueva unidad asignada a la ruta Pasto - Cali."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Etiqueta */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Etiqueta / Categoría
                </label>
                <input
                  type="text"
                  value={nuevaFotoTag}
                  onChange={(e) => setNuevaFotoTag(e.target.value)}
                  placeholder="Ej. Nueva Flota, Eventos, Operaciones"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={handleRestablecerPredeterminadas}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Restablecer fotos originales
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMostrarModalSubir(false)}
                  style={{
                    background: 'white',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarNuevaFoto}
                  style={{
                    background: '#0D3B8E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Guardar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
