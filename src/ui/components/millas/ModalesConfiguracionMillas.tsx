import { useEffect, useState } from 'react';
import type {
  NivelMillas, NivelMillasInput,
  RecompensaMillas, RecompensaMillasInput,
  PromocionMillas, PromocionMillasInput,
  TipoPromocion, OrigenPromocion,
} from '../../../infrastructure/services/configuracionMillasApi';
import {
  C, FONT, inputStyle, labelStyle, grid2,
  botonPrimario, botonSecundario, botonPeligro,
} from './estilosMillas';

// ── Campo con etiqueta ───────────────────────────────────────────────────────
export const Campo = ({ label, ayuda, children, id }: {
  label: string; ayuda?: string; children: React.ReactNode; id?: string;
}) => (
  <div>
    <label style={labelStyle} htmlFor={id}>{label}</label>
    {children}
    {ayuda && (
      <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.onSurfaceVariant, fontFamily: FONT }}>{ayuda}</p>
    )}
  </div>
);

// ── Interruptor accesible ────────────────────────────────────────────────────
export const Interruptor = ({ label, ayuda, valor, onChange, id }: {
  label: string; ayuda?: string; valor: boolean; onChange: (v: boolean) => void; id: string;
}) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '11px 13px',
    border: `1px solid ${C.outlineVariant}`, borderRadius: '10px', background: '#fff',
  }}>
    <input
      id={id}
      type="checkbox"
      checked={valor}
      onChange={e => onChange(e.target.checked)}
      style={{ width: '17px', height: '17px', marginTop: '1px', cursor: 'pointer', flexShrink: 0 }}
    />
    <label htmlFor={id} style={{ cursor: 'pointer', fontFamily: FONT }}>
      <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: C.onSurface }}>{label}</span>
      {ayuda && <span style={{ display: 'block', fontSize: '11.5px', color: C.onSurfaceVariant, marginTop: '2px' }}>{ayuda}</span>}
    </label>
  </div>
);

// ── Cascarón de modal ────────────────────────────────────────────────────────
export const ModalShell = ({ titulo, icono, onClose, onGuardar, guardando, error, ancho = '620px', children }: {
  titulo: string; icono: string; onClose: () => void; onGuardar: () => void;
  guardando: boolean; error: string | null; ancho?: string; children: React.ReactNode;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        style={{
          background: '#fff', borderRadius: '18px', width: '100%', maxWidth: ancho,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{
              width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px' }}>{icono}</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: FONT }}>{titulo}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#fff', display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>close</span>
          </button>
        </div>

        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              background: C.errorBg, border: '1px solid #fca5a5', borderRadius: '10px',
              padding: '10px 13px', marginBottom: '16px', display: 'flex', gap: '8px',
              color: C.error, fontSize: '12.5px', fontWeight: 600, fontFamily: FONT,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>error</span>
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>

        <div style={{
          padding: '13px 22px', borderTop: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow,
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
        }}>
          <button onClick={onClose} style={botonSecundario}>Cancelar</button>
          <button onClick={onGuardar} disabled={guardando} style={botonPrimario(guardando)}>
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
              {guardando ? 'progress_activity' : 'save'}
            </span>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal de nivel ───────────────────────────────────────────────────────────
export const ModalNivel = ({ nivel, onClose, onGuardar, guardando, error }: {
  nivel: NivelMillas | null;
  onClose: () => void;
  onGuardar: (datos: NivelMillasInput & { orden?: number }) => void;
  guardando: boolean;
  error: string | null;
}) => {
  const [codigo, setCodigo] = useState(nivel?.codigo ?? '');
  const [nombre, setNombre] = useState(nivel?.nombre ?? '');
  const [minMillas, setMinMillas] = useState(String(nivel?.minmillas ?? 0));
  const [sinTope, setSinTope] = useState(nivel ? nivel.maxmillas == null : false);
  const [maxMillas, setMaxMillas] = useState(nivel?.maxmillas != null ? String(nivel.maxmillas) : '');
  const [multiplicador, setMultiplicador] = useState(String(nivel?.multiplicador ?? 1));
  const [descuento, setDescuento] = useState(nivel?.descuentotiquetes ?? '0%');
  const [color, setColor] = useState(nivel?.color ?? '#cd7f32');
  const [activo, setActivo] = useState(nivel?.activo ?? true);
  const [beneficios, setBeneficios] = useState<string[]>(
    nivel?.beneficios?.length ? [...nivel.beneficios] : ['']
  );

  const cambiarBeneficio = (i: number, valor: string) =>
    setBeneficios(prev => prev.map((b, idx) => (idx === i ? valor : b)));

  return (
    <ModalShell
      titulo={nivel ? `Editar nivel: ${nivel.nombre}` : 'Nuevo nivel del club'}
      icono="military_tech"
      onClose={onClose}
      guardando={guardando}
      error={error}
      onGuardar={() => onGuardar({
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        minMillas: Number(minMillas),
        maxMillas: sinTope ? null : (maxMillas === '' ? null : Number(maxMillas)),
        color,
        badgeBg: nivel?.badgebg ?? null,
        multiplicador: Number(multiplicador),
        descuentoTiquetes: descuento.trim(),
        beneficios: beneficios.map(b => b.trim()).filter(Boolean),
        activo,
        ...(nivel ? { orden: nivel.orden } : {}),
      })}
    >
      <div style={grid2}>
        <Campo label="Código *" id="niv-codigo" ayuda="Identificador interno, solo mayúsculas">
          <input id="niv-codigo" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
            placeholder="ORO" maxLength={30} style={inputStyle} />
        </Campo>
        <Campo label="Nombre visible *" id="niv-nombre">
          <input id="niv-nombre" value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Oro" maxLength={80} style={inputStyle} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Desde (millas) *" id="niv-min">
          <input id="niv-min" type="number" min={0} value={minMillas}
            onChange={e => setMinMillas(e.target.value)} style={inputStyle} />
        </Campo>
        <Campo label="Hasta (millas)" id="niv-max" ayuda={sinTope ? 'Nivel más alto: sin tope' : 'Inclusive'}>
          <input id="niv-max" type="number" min={0} value={maxMillas} disabled={sinTope}
            onChange={e => setMaxMillas(e.target.value)}
            style={{ ...inputStyle, opacity: sinTope ? 0.5 : 1 }} />
        </Campo>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <Interruptor
          id="niv-sintope"
          label="Sin tope superior"
          ayuda="Úsalo solo en el nivel más alto del programa"
          valor={sinTope}
          onChange={setSinTope}
        />
      </div>

      <div style={grid2}>
        <Campo label="Multiplicador *" id="niv-mult" ayuda="1 = acumulación base. Máximo 10">
          <input id="niv-mult" type="number" step="0.05" min={1} max={10} value={multiplicador}
            onChange={e => setMultiplicador(e.target.value)} style={inputStyle} />
        </Campo>
        <Campo label="Descuento en tiquetes" id="niv-desc" ayuda="Texto informativo, ej: 10%">
          <input id="niv-desc" value={descuento} onChange={e => setDescuento(e.target.value)}
            placeholder="10%" maxLength={20} style={inputStyle} />
        </Campo>
        <Campo label="Color" id="niv-color">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input id="niv-color" type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: '44px', height: '38px', padding: '2px', border: `1.5px solid ${C.outlineVariant}`, borderRadius: '9px', cursor: 'pointer', background: '#fff' }} />
            <input value={color} onChange={e => setColor(e.target.value)} style={inputStyle} />
          </div>
        </Campo>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Beneficios del nivel</label>
        {beneficios.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: '7px', marginBottom: '7px' }}>
            <input
              value={b}
              onChange={e => cambiarBeneficio(i, e.target.value)}
              placeholder="Ej: 10% de descuento en todos tus pasajes"
              style={inputStyle}
              aria-label={`Beneficio ${i + 1}`}
            />
            <button
              onClick={() => setBeneficios(prev => prev.filter((_, idx) => idx !== i))}
              title="Quitar beneficio"
              aria-label={`Quitar beneficio ${i + 1}`}
              style={{ ...botonPeligro, padding: '8px 10px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
            </button>
          </div>
        ))}
        <button onClick={() => setBeneficios(prev => [...prev, ''])} style={{ ...botonSecundario, padding: '8px 13px', fontSize: '12.5px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Agregar beneficio
        </button>
      </div>

      <Interruptor id="niv-activo" label="Nivel activo" ayuda="Los niveles inactivos no se usan al calcular el nivel del cliente" valor={activo} onChange={setActivo} />
    </ModalShell>
  );
};

// ── Modal de recompensa ──────────────────────────────────────────────────────
export const ModalRecompensa = ({ recompensa, onClose, onGuardar, guardando, error }: {
  recompensa: RecompensaMillas | null;
  onClose: () => void;
  onGuardar: (datos: RecompensaMillasInput & { orden?: number }) => void;
  guardando: boolean;
  error: string | null;
}) => {
  const [titulo, setTitulo] = useState(recompensa?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(recompensa?.descripcion ?? '');
  const [millas, setMillas] = useState(String(recompensa?.millasrequeridas ?? 1000));
  const [valorCop, setValorCop] = useState(String(recompensa?.valordescuentocop ?? 0));
  const [categoria, setCategoria] = useState(recompensa?.categoria ?? 'Tiquetes');
  const [icono, setIcono] = useState(recompensa?.icono ?? 'confirmation_number');
  const [destacado, setDestacado] = useState(recompensa?.destacado ?? false);
  const [activo, setActivo] = useState(recompensa?.activo ?? true);

  return (
    <ModalShell
      titulo={recompensa ? `Editar recompensa` : 'Nueva recompensa'}
      icono="redeem"
      onClose={onClose}
      guardando={guardando}
      error={error}
      onGuardar={() => onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        millasRequeridas: Number(millas),
        valorDescuentoCop: Number(valorCop),
        categoria: categoria.trim(),
        icono: icono.trim(),
        destacado,
        activo,
        ...(recompensa ? { orden: recompensa.orden } : {}),
      })}
    >
      <div style={{ marginBottom: '14px' }}>
        <Campo label="Título *" id="rec-titulo">
          <input id="rec-titulo" value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Descuento $10.000 COP" maxLength={150} style={inputStyle} />
        </Campo>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <Campo label="Descripción" id="rec-desc">
          <textarea id="rec-desc" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
            placeholder="Cupón de descuento directo para cualquier viaje Cootranar"
            style={{ ...inputStyle, resize: 'vertical' }} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Millas requeridas *" id="rec-millas">
          <input id="rec-millas" type="number" min={1} value={millas}
            onChange={e => setMillas(e.target.value)} style={inputStyle} />
        </Campo>
        <Campo label="Valor equivalente (COP)" id="rec-valor" ayuda="Solo informativo">
          <input id="rec-valor" type="number" min={0} value={valorCop}
            onChange={e => setValorCop(e.target.value)} style={inputStyle} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Categoría" id="rec-cat" ayuda="Aparece como etiqueta en la tarjeta">
          <input id="rec-cat" value={categoria} onChange={e => setCategoria(e.target.value)}
            placeholder="Tiquetes" maxLength={50} style={inputStyle} />
        </Campo>
        <Campo label="Icono" id="rec-icono" ayuda="Nombre de Material Symbols">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input id="rec-icono" value={icono} onChange={e => setIcono(e.target.value)}
              placeholder="confirmation_number" style={inputStyle} />
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: C.secondary }}>{icono}</span>
          </div>
        </Campo>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        <Interruptor id="rec-destacado" label="Destacada" ayuda="Se marca como Popular en el catálogo del cliente" valor={destacado} onChange={setDestacado} />
        <Interruptor id="rec-activo" label="Visible para el cliente" valor={activo} onChange={setActivo} />
      </div>
    </ModalShell>
  );
};

// ── Modal de promoción ───────────────────────────────────────────────────────
const AYUDA_TIPO: Record<TipoPromocion, string> = {
  MULTIPLICADOR: 'Multiplica las millas del viaje. Valor 2 = doble de millas.',
  PORCENTAJE_EXTRA: 'Suma un porcentaje sobre las millas del viaje. Valor 20 = 20% más.',
  MILLAS_EXTRA: 'Suma una cantidad fija de millas por viaje. Valor 500 = 500 millas extra.',
};

export const ModalPromocion = ({ promocion, rutas, onClose, onGuardar, guardando, error }: {
  promocion: PromocionMillas | null;
  rutas: Array<{ idruta: number; nombre: string }>;
  onClose: () => void;
  onGuardar: (datos: PromocionMillasInput) => void;
  guardando: boolean;
  error: string | null;
}) => {
  const hoy = new Date().toISOString().split('T')[0];
  const soloFecha = (f?: string | null) => (f ? String(f).split('T')[0] : '');

  const [nombre, setNombre] = useState(promocion?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(promocion?.descripcion ?? '');
  const [tipo, setTipo] = useState<TipoPromocion>(promocion?.tipo ?? 'MULTIPLICADOR');
  const [valor, setValor] = useState(String(promocion?.valor ?? 2));
  const [fechaInicio, setFechaInicio] = useState(soloFecha(promocion?.fechainicio) || hoy);
  const [fechaFin, setFechaFin] = useState(soloFecha(promocion?.fechafin) || hoy);
  const [origen, setOrigen] = useState<OrigenPromocion>(promocion?.origenaplicable ?? 'AMBOS');
  const [idRuta, setIdRuta] = useState<string>(promocion?.idruta != null ? String(promocion.idruta) : '');
  const [montoMinimo, setMontoMinimo] = useState(String(promocion?.montominimo ?? 0));
  const [topeMillas, setTopeMillas] = useState(promocion?.topemillas != null ? String(promocion.topemillas) : '');
  const [icono, setIcono] = useState(promocion?.icono ?? 'campaign');
  const [color, setColor] = useState(promocion?.color ?? '#f59e0b');
  const [activo, setActivo] = useState(promocion?.activo ?? true);

  return (
    <ModalShell
      titulo={promocion ? 'Editar promoción' : 'Nueva promoción de millas'}
      icono="campaign"
      ancho="700px"
      onClose={onClose}
      guardando={guardando}
      error={error}
      onGuardar={() => onGuardar({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        tipo,
        valor: Number(valor),
        fechaInicio,
        fechaFin,
        origenAplicable: origen,
        idRuta: idRuta === '' ? null : Number(idRuta),
        montoMinimo: Number(montoMinimo),
        topeMillas: topeMillas === '' ? null : Number(topeMillas),
        icono: icono.trim(),
        color,
        activo,
      })}
    >
      <div style={{ marginBottom: '14px' }}>
        <Campo label="Nombre de la campaña *" id="promo-nombre">
          <input id="promo-nombre" value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Doble millas de fin de año" maxLength={150} style={inputStyle} />
        </Campo>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <Campo label="Descripción" id="promo-desc">
          <textarea id="promo-desc" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
            placeholder="Acumula el doble de millas en todos los viajes de diciembre"
            style={{ ...inputStyle, resize: 'vertical' }} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Tipo de beneficio *" id="promo-tipo" ayuda={AYUDA_TIPO[tipo]}>
          <select id="promo-tipo" value={tipo} onChange={e => setTipo(e.target.value as TipoPromocion)}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="MULTIPLICADOR">Multiplicador</option>
            <option value="PORCENTAJE_EXTRA">Porcentaje extra</option>
            <option value="MILLAS_EXTRA">Millas fijas extra</option>
          </select>
        </Campo>
        <Campo label="Valor *" id="promo-valor">
          <input id="promo-valor" type="number" step={tipo === 'MULTIPLICADOR' ? '0.1' : '1'}
            min={tipo === 'MULTIPLICADOR' ? 1 : 1} value={valor}
            onChange={e => setValor(e.target.value)} style={inputStyle} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Desde *" id="promo-inicio">
          <input id="promo-inicio" type="date" value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)} style={inputStyle} />
        </Campo>
        <Campo label="Hasta *" id="promo-fin">
          <input id="promo-fin" type="date" value={fechaFin}
            onChange={e => setFechaFin(e.target.value)} style={inputStyle} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Canal de venta" id="promo-origen" ayuda="Dónde aplica la promoción">
          <select id="promo-origen" value={origen} onChange={e => setOrigen(e.target.value as OrigenPromocion)}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="AMBOS">Taquilla y e-commerce</option>
            <option value="Taquilla">Solo taquilla</option>
            <option value="E-commerce">Solo e-commerce</option>
          </select>
        </Campo>
        <Campo label="Ruta" id="promo-ruta" ayuda="Vacío = todas las rutas">
          <select id="promo-ruta" value={idRuta} onChange={e => setIdRuta(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Todas las rutas</option>
            {rutas.map(r => <option key={r.idruta} value={r.idruta}>{r.nombre}</option>)}
          </select>
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Valor mínimo del tiquete (COP)" id="promo-monto" ayuda="0 = sin mínimo">
          <input id="promo-monto" type="number" min={0} value={montoMinimo}
            onChange={e => setMontoMinimo(e.target.value)} style={inputStyle} />
        </Campo>
        <Campo label="Tope de millas extra" id="promo-tope" ayuda="Vacío = sin tope, por tiquete">
          <input id="promo-tope" type="number" min={1} value={topeMillas}
            onChange={e => setTopeMillas(e.target.value)} style={inputStyle} />
        </Campo>
      </div>

      <div style={grid2}>
        <Campo label="Icono" id="promo-icono">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input id="promo-icono" value={icono} onChange={e => setIcono(e.target.value)}
              placeholder="campaign" style={inputStyle} />
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: C.secondary }}>{icono}</span>
          </div>
        </Campo>
        <Campo label="Color" id="promo-color">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input id="promo-color" type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: '44px', height: '38px', padding: '2px', border: `1.5px solid ${C.outlineVariant}`, borderRadius: '9px', cursor: 'pointer', background: '#fff' }} />
            <input value={color} onChange={e => setColor(e.target.value)} style={inputStyle} />
          </div>
        </Campo>
      </div>

      <Interruptor id="promo-activo" label="Promoción activa" ayuda="Si está inactiva no otorga millas, aunque esté dentro de las fechas" valor={activo} onChange={setActivo} />
    </ModalShell>
  );
};
