import React, { useState } from 'react';

const T = {
  primary:        '#0f172a',
  onPrimary:      '#ffffff',
  background:     '#f8f9ff',
  onSurfaceVar:   '#45464d',
  outline:        '#c6c6cd',
  outlineVariant: '#e5eeff',
  error:          '#ba1a1a',
};

interface SelectorGrupoProps {
  viaje?: any;
  asientosLibres?: number;
  onConfirmar: (adultos: number, ninos: number) => void;
  onVolver: () => void;
}

// ── Stepper button ────────────────────────────────────────────────────────────
const StepBtn: React.FC<{
  variant: 'outlined' | 'filled';
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ variant, icon, onClick, disabled }) => {
  const [hovered, setHovered] = useState(false);

  const base: React.CSSProperties = {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', outline: 'none', flexShrink: 0,
    opacity: disabled ? 0.35 : 1,
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={variant === 'filled'
        ? { ...base, background: T.primary, border: 'none', color: T.onPrimary, boxShadow: '0 1px 3px rgba(0,0,0,.12)' }
        : { ...base, background: hovered && !disabled ? T.primary : 'transparent', border: `1px solid ${T.outline}`, color: hovered && !disabled ? T.onPrimary : T.primary }
      }
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
        {icon}
      </span>
    </button>
  );
};

// ── Continuar button ──────────────────────────────────────────────────────────
const ContinuarBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [hov, setHov] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: '100%', background: T.primary, color: '#fff',
        border: 'none', borderRadius: 8, padding: '18px 0',
        fontSize: 18, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'inherit',
        boxShadow: hov
          ? '0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)'
          : '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)',
        transform: active ? 'scale(0.99)' : 'scale(1)',
        transition: 'all 0.15s',
      }}
    >
      Continuar
      <span className="material-symbols-outlined" style={{ fontSize: 22, transform: hov ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
        arrow_forward
      </span>
    </button>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export const SelectorGrupo: React.FC<SelectorGrupoProps> = ({
  asientosLibres = 40,
  onConfirmar,
  onVolver,
}) => {
  const [adultos, setAdultos] = useState(1);
  const [ninos,   setNinos]   = useState(0);

  const total      = adultos + ninos;
  const maxAdultos = Math.max(1, asientosLibres - ninos);
  const maxNinos   = Math.max(0, asientosLibres - adultos);

  const adultText  = adultos === 1 ? '1 adulto' : `${adultos} adultos`;
  const kidsText   = ninos === 0 ? '' : ninos === 1 ? ' y 1 niño' : ` y ${ninos} niños`;
  const totalLabel = `${total} ${total === 1 ? 'pasajero' : 'pasajeros'} (${adultText}${kidsText})`;

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", WebkitFontSmoothing: 'antialiased', display: 'flex', justifyContent: 'center', padding: '3rem 1rem 4rem' }}>
      <div style={{ width: '100%', maxWidth: 512 }}>

        {/* Back */}
        <button
          type="button"
          onClick={onVolver}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.onSurfaceVar, fontSize: 14, fontWeight: 500,
            marginBottom: 40, padding: 0, fontFamily: 'inherit',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.primary)}
          onMouseLeave={e => (e.currentTarget.style.color = T.onSurfaceVar)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Buscador
        </button>

        {/* Title */}
        <header style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em', color: T.primary, lineHeight: 1.1 }}>
            ¿Cuántos viajan?
          </h1>
          <p style={{ margin: 0, fontSize: 18, color: T.onSurfaceVar }}>
            Configura los pasajeros para este viaje
          </p>
        </header>

        {/* Rows */}
        <div style={{ marginBottom: 64 }}>

          {/* Adultos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 40 }}>
            <div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: T.primary }}>Adultos</p>
              <p style={{ margin: '2px 0 0', fontSize: 14, color: T.onSurfaceVar }}>Tarifa regular</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <StepBtn variant="outlined" icon="remove" onClick={() => setAdultos(a => Math.max(1, a - 1))} disabled={adultos <= 1} />
              <span style={{ fontSize: 36, fontWeight: 700, width: 32, textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: T.primary }}>
                {adultos}
              </span>
              <StepBtn variant="filled" icon="add" onClick={() => setAdultos(a => Math.min(maxAdultos, a + 1))} disabled={adultos >= maxAdultos} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: T.outlineVariant, marginBottom: 40 }} />

          {/* Niños */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: T.primary }}>Niños</p>
              <p style={{ margin: '2px 0 0', fontSize: 14, color: T.onSurfaceVar }}>Menores de 12 años</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <StepBtn variant="outlined" icon="remove" onClick={() => setNinos(n => Math.max(0, n - 1))} disabled={ninos <= 0} />
              <span style={{ fontSize: 36, fontWeight: 700, width: 32, textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: ninos > 0 ? T.primary : T.onSurfaceVar }}>
                {ninos}
              </span>
              <StepBtn variant="filled" icon="add" onClick={() => setNinos(n => Math.min(maxNinos, n + 1))} disabled={ninos >= maxNinos} />
            </div>
          </div>
        </div>

        {/* Summary + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ margin: 0, fontSize: 14, color: T.onSurfaceVar, fontWeight: 500 }}>
              Total: <strong style={{ color: T.primary }}>{totalLabel}</strong>
            </p>
          </div>

          <ContinuarBtn onClick={() => onConfirmar(adultos, ninos)} />

          <button
            type="button"
            onClick={onVolver}
            style={{
              width: '100%', padding: '14px 0', background: 'none', border: 'none',
              cursor: 'pointer', color: T.error, fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit', opacity: 0.6, transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          >
            Cancelar proceso
          </button>
        </div>

      </div>
    </div>
  );
};
