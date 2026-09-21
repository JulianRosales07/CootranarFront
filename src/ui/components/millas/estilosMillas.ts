/**
 * Paleta y estilos compartidos por la administración del programa de millas.
 * Viven aparte de los componentes para no romper react-refresh.
 *
 * Los tonos son los mismos que usa el resto del sistema interno, así que el CSS
 * de modo oscuro de index.css los reasigna solo. Evitar degradados y box-shadow
 * de color: esos son los puntos ciegos del mapeo por atributo.
 */
export const C = {
  primary:             '#00355f',
  primaryContainer:    '#0f4c81',
  secondary:           '#0058be',
  secondaryFixed:      '#d8e2ff',
  surfaceContainerLow: '#eff4ff',
  outlineVariant:      '#c2c7d1',
  outline:             '#727780',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#42474f',
  success:             '#15803d',
  successBg:           '#dcfce7',
  warning:             '#b45309',
  warningBg:           '#fef3c7',
  error:               '#b91c1c',
  errorBg:             '#fee2e2',
};

export const FONT = "'Hanken Grotesk', 'Plus Jakarta Sans', sans-serif";

export const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: `1.5px solid ${C.outlineVariant}`, borderRadius: '9px',
  fontSize: '13.5px', fontFamily: FONT, color: C.onSurface, background: '#fff',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

export const labelStyle: React.CSSProperties = {
  fontSize: '10.5px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px', fontFamily: FONT,
};

export const TH: React.CSSProperties = {
  padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: C.onSurfaceVariant,
  background: C.surfaceContainerLow, borderBottom: `2px solid ${C.outlineVariant}`,
  fontFamily: FONT, whiteSpace: 'nowrap',
};

export const TD: React.CSSProperties = {
  padding: '12px 14px', borderBottom: `1px solid ${C.outlineVariant}`,
  verticalAlign: 'middle', fontFamily: FONT, fontSize: '13px', color: C.onSurface,
};

export const botonPrimario = (deshabilitado = false): React.CSSProperties => ({
  padding: '10px 18px', background: C.primary, color: '#fff', border: 'none',
  borderRadius: '9px', fontSize: '13.5px', fontWeight: 800, fontFamily: FONT,
  cursor: deshabilitado ? 'not-allowed' : 'pointer', opacity: deshabilitado ? 0.55 : 1,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
});

export const botonSecundario: React.CSSProperties = {
  padding: '10px 16px', background: '#fff', color: C.primary,
  border: `1.5px solid ${C.outlineVariant}`, borderRadius: '9px',
  fontSize: '13.5px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '6px',
};

export const botonPeligro: React.CSSProperties = {
  padding: '6px 10px', background: C.errorBg, color: C.error,
  border: '1px solid #fca5a5', borderRadius: '7px',
  fontSize: '12px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '4px',
};

export const botonIcono: React.CSSProperties = {
  padding: '6px 10px', background: C.secondaryFixed, color: C.primary, border: 'none',
  borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
  gap: '4px', fontSize: '12px', fontWeight: 700, fontFamily: FONT,
};

export const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '13px', marginBottom: '14px',
};
