import React, { useState, useEffect } from 'react';
import {
  type FotoCootranar,
  FOTOS_PREDETERMINADAS,
  guardarFotos,
  leerFotosGuardadas,
} from './galeriaBanner';
import { ModalGestionGaleria } from './ModalGestionGaleria';

export const GaleriaCootranarBanner: React.FC = () => {
  const [fotos, setFotos] = useState<FotoCootranar[]>(() => leerFotosGuardadas());
  const [indiceActual, setIndiceActual] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [modal, setModal] = useState<'cerrado' | 'lista' | 'formulario'>('cerrado');
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  // Autoplay cada 5.5 segundos
  useEffect(() => {
    if (!autoPlay || fotos.length <= 1 || modal !== 'cerrado') return;

    const timer = setInterval(() => {
      setIndiceActual(prev => (prev + 1) % fotos.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [autoPlay, fotos.length, modal]);

  // El índice se deriva para que nunca quede fuera de rango tras reordenar o borrar
  const indiceSeguro = fotos.length === 0 ? 0 : Math.min(indiceActual, fotos.length - 1);
  const fotoActual = fotos[indiceSeguro];

  const handleAnterior = () => setIndiceActual((indiceSeguro - 1 + fotos.length) % fotos.length);
  const handleSiguiente = () => setIndiceActual((indiceSeguro + 1) % fotos.length);

  /**
   * Aplica los cambios del modal. Si el navegador no puede persistirlos se avisa
   * en vez de dejar que se pierdan en silencio al recargar.
   */
  const aplicarCambios = (nuevas: FotoCootranar[]) => {
    const lista = nuevas.length > 0 ? nuevas : FOTOS_PREDETERMINADAS;
    setFotos(lista);
    setIndiceActual(prev => Math.min(prev, lista.length - 1));
    setModal('cerrado');

    const resultado = guardarFotos(lista);
    setErrorGuardado(resultado.ok ? null : resultado.mensaje);
  };

  if (!fotoActual) return null;

  return (
    <div style={{ marginBottom: '6px' }}>
      {errorGuardado && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '9px', marginBottom: '8px',
          padding: '10px 13px', borderRadius: '10px',
          background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e',
          fontSize: '12.5px', fontWeight: 600,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>warning</span>
          <span>
            {errorGuardado} Los cambios se ven ahora, pero se perderán al recargar la página.
          </span>
          <button
            onClick={() => setErrorGuardado(null)}
            aria-label="Cerrar aviso"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
          </button>
        </div>
      )}

      <div
        style={{
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          position: 'relative',
          backgroundColor: '#0f172a',
        }}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(260px, 28vw, 350px)',
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
              objectPosition: 'center 55%',
              filter: 'brightness(0.9) contrast(1.06)',
              transform: 'scale(1.01)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
            }}
          />

          {/* Gradientes cinematográficos */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(10, 22, 53, 0.88) 0%, rgba(13, 59, 142, 0.42) 45%, rgba(0, 0, 0, 0.1) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(0deg, rgba(10, 15, 30, 0.72) 0%, transparent 65%)',
            }}
          />

          {/* Contenido superpuesto */}
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
            {/* Barra superior: etiqueta, contador y acciones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
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
                  {indiceSeguro + 1} / {fotos.length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setModal('lista')}
                  title="Administrar la galería: orden, edición y eliminación"
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
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>collections</span>
                  <span>Administrar</span>
                </button>

                <button
                  onClick={() => setModal('formulario')}
                  title="Subir una nueva foto"
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
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_photo_alternate</span>
                  <span>Agregar Foto</span>
                </button>
              </div>
            </div>

            {/* Contenido inferior: título, descripción y controles */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Indicadores */}
                <div style={{ display: 'flex', gap: '6px', marginRight: '4px' }}>
                  {fotos.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => setIndiceActual(i)}
                      title={`Ir a ${f.titulo}`}
                      aria-label={`Ir a ${f.titulo}`}
                      style={{
                        width: i === indiceSeguro ? '22px' : '7px',
                        height: '7px',
                        borderRadius: '4px',
                        background: i === indiceSeguro ? '#60a5fa' : 'rgba(255, 255, 255, 0.35)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleAnterior}
                  title="Foto anterior"
                  aria-label="Foto anterior"
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
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>chevron_left</span>
                </button>

                <button
                  onClick={handleSiguiente}
                  title="Foto siguiente"
                  aria-label="Foto siguiente"
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
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal !== 'cerrado' && (
        <ModalGestionGaleria
          fotos={fotos}
          abrirEnFormulario={modal === 'formulario'}
          onGuardar={aplicarCambios}
          onClose={() => setModal('cerrado')}
        />
      )}
    </div>
  );
};
