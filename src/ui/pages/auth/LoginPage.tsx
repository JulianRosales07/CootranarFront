import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../../shared/constants';
import heroImg from '../../../assets/BusCootranar.jpg';
import logoImg from '../../../assets/LOGO-COOTRANAR.png';

/* ─────────────────────────────────────────────
   Inline styles & keyframe injection
───────────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&display=swap');

  @keyframes cui-zoomIn {
    from { transform: scale(1.18); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  @keyframes cui-slideRight {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes cui-cardIn {
    from { opacity: 0; transform: translateY(28px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);  }
  }
  @keyframes cui-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cui-shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-6px); }
    40%,80% { transform: translateX(6px); }
  }
  @keyframes cui-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes cui-overlayIn {
    from { opacity: 0; transform: scale(.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes cui-bounceIn {
    0%   { transform: scale(0) rotate(-90deg); opacity: 0; }
    65%  { transform: scale(1.12) rotate(4deg); opacity: 1; }
    100% { transform: scale(1) rotate(0); }
  }
  @keyframes cui-dot {
    0%,80%,100% { transform: scale(0); opacity: .45; }
    40%          { transform: scale(1); opacity: 1; }
  }
  @keyframes cui-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: .9; }
  }
  @keyframes cui-slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cui-slideInUp {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Responsive layout */
  @media (min-width: 1024px) {
    .cootranar-content {
      flex-direction: row !important;
    }
    .cootranar-branding {
      display: flex !important;
    }
    .cootranar-cta-button {
      display: none !important;
    }
    .cootranar-back-button {
      display: none !important;
    }
    .cootranar-form-panel {
      padding: 2rem 3rem !important;
      width: 580px !important;
      flex: none !important;
      display: flex !important;
    }
    .cootranar-card {
      padding: 2.5rem 2.5rem 2rem !important;
    }
  }

  @media (max-width: 1023px) {
    .cootranar-content {
      flex-direction: column !important;
      padding: 0 !important;
      justify-content: center !important;
      min-height: 100vh !important;
    }
    .cootranar-branding {
      display: flex !important;
      padding: 2rem 1.5rem !important;
      flex: 1 !important;
      justify-content: center !important;
    }
    .cootranar-branding.hidden {
      display: none !important;
    }
    .cootranar-cta-button {
      display: inline-flex !important;
    }
    .cootranar-back-button {
      display: flex !important;
    }
    .cootranar-form-panel {
      padding: 1rem !important;
      width: 100% !important;
      flex: 1 !important;
      box-sizing: border-box !important;
    }
    .cootranar-form-panel.hidden {
      display: none !important;
    }
    .cootranar-form-panel.show {
      display: flex !important;
      animation: cui-slideInUp .5s ease-out forwards !important;
    }
    .cootranar-card {
      padding: 2rem 1.25rem 1.5rem !important;
      border-radius: 20px !important;
      max-width: 100% !important;
      width: 100% !important;
      box-sizing: border-box !important;
      margin: 0 !important;
    }
  }
`;

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <polyline
        points="2,6.5 5.5,10 11,3"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
      <path d="M8 5v3.2M8 10.5h.01" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export const LoginPage = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [shakeKey, setShakeKey]     = useState(0); // re-triggers shake animation
  const [showForm, setShowForm]     = useState(false); // controls form visibility on mobile

  const errorRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const navigate  = useNavigate();

  /* Inject keyframes once */
  useEffect(() => {
    const id = 'cootranar-kf';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  /* Trigger shake whenever a new error appears */
  useEffect(() => {
    if (error) setShakeKey(k => k + 1);
  }, [error]);

  /* ── Show form handler ── */
  const handleShowForm = () => {
    setShowForm(true);
    // Small delay to ensure the form is rendered before scrolling
    setTimeout(() => {
      const formPanel = document.querySelector('.cootranar-form-panel');
      if (formPanel) {
        formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  /* ── Hide form handler ── */
  const handleHideForm = () => {
    setShowForm(false);
  };

  /* ── Handlers ── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    if (!email.includes('@')) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setLoginSuccess(true);
      // Reducido de 2400ms a 800ms para un flujo más rápido
      setTimeout(() => navigate(ROUTES.DASHBOARD), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(msg);
      setLoading(false);
    }
  };

  /* ── Styles (inline objects) ── */
  const S = {
    /* page */
    page: {
      position: 'relative' as const,
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      fontFamily: "'Open Sans', system-ui, sans-serif",
    },

    /* hero */
    heroBg: {
      position: 'absolute' as const,
      inset: 0,
      zIndex: 0,
      animation: 'cui-zoomIn 1.3s ease-out forwards',
    },
    heroImg: {
      width: '100%', height: '100%',
      objectFit: 'cover' as const,
      display: 'block',
    },
    heroOverlay: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(135deg, rgba(26,58,110,.84) 0%, rgba(30,77,183,.73) 55%, rgba(26,58,110,.88) 100%)',
    },

    /* accent bar */
    accentBar: {
      position: 'absolute' as const,
      left: 0, top: 0,
      width: 4, height: '100%',
      background: 'linear-gradient(to bottom, #93c5fd, #2563eb, #1e3a8a)',
      zIndex: 2,
    },

    /* content wrapper */
    content: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      width: '100%',
      minHeight: '100vh',
      boxSizing: 'border-box' as const,
    },

    /* branding */
    branding: {
      flex: 1,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem 5rem',
      animation: 'cui-slideRight .9s .15s both',
      textAlign: 'center' as const,
    },

    logoRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '2.5rem',
    },
    logoIcon: {
      width: 66, height: 66,
      background: '#fff',
      borderRadius: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,.28)',
      flexShrink: 0,
    },
    logoLetter: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '2.1rem',
      fontWeight: 900,
      color: '#2563eb',
      lineHeight: 1,
    },
    logoName: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '2.6rem',
      fontWeight: 900,
      color: '#fff',
      letterSpacing: '.04em',
      textShadow: '0 2px 12px rgba(0,0,0,.3)',
    },

    tagline: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#fff',
      marginBottom: '1rem',
      textShadow: '0 1px 8px rgba(0,0,0,.3)',
    },
    taglineSub: {
      fontSize: '1rem',
      color: 'rgba(255,255,255,.9)',
      lineHeight: 1.75,
      maxWidth: 450,
      marginBottom: '2rem',
      textShadow: '0 1px 6px rgba(0,0,0,.2)',
      margin: '0 auto 2rem',
    },

    features: { 
      display: 'flex', 
      flexDirection: 'column' as const, 
      gap: '1rem', 
      alignItems: 'center',
      marginBottom: '2rem',
    },
    featureItem: { display: 'flex', alignItems: 'center', gap: '.75rem' },
    featureDot: {
      width: 24, height: 24,
      background: '#2563eb',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 10px rgba(37,99,235,.5)',
    },
    featureText: {
      color: 'rgba(255,255,255,.95)',
      fontSize: '1rem',
      fontWeight: 500,
      textShadow: '0 1px 4px rgba(0,0,0,.2)',
    },

    /* CTA button */
    ctaButton: {
      marginTop: '1rem',
      padding: '1.2rem 3rem',
      background: '#fff',
      color: '#2563eb',
      border: 'none',
      borderRadius: 50,
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '1.15rem',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0, 0, 0, .25)',
      transition: 'all .3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '.75rem',
      animation: 'cui-slideUp 1s .8s both',
      letterSpacing: '.02em',
      minWidth: 220,
    },
    arrowIcon: {
      fontSize: '1.3rem',
      transition: 'transform .3s ease',
      fontWeight: 'bold',
    },

    /* Back button */
    backButton: {
      position: 'absolute' as const,
      top: '1.5rem',
      left: '1rem',
      background: 'rgba(255, 255, 255, .15)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      borderRadius: '50%',
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      fontSize: '1.5rem',
      transition: 'all .3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, .2)',
      zIndex: 10,
    },

    /* form panel */
    formPanel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 3rem',
      minWidth: 0,
      boxSizing: 'border-box' as const,
    },

    card: {
      background: '#fff',
      borderRadius: 22,
      padding: '2.5rem 2.5rem 2rem',
      width: '100%',
      maxWidth: 440,
      boxShadow: '0 24px 64px rgba(0,0,0,.22), 0 4px 16px rgba(0,0,0,.1)',
      animation: 'cui-cardIn .8s .25s both',
      boxSizing: 'border-box' as const,
    },

    cardTitle: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '1.65rem',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '.35rem',
    },
    cardSub: {
      fontSize: '.85rem',
      color: '#9ca3af',
      marginBottom: '1.75rem',
      lineHeight: 1.55,
    },

    /* inputs */
    fieldWrap: { marginBottom: '1.1rem' },
    fieldHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '.45rem',
    },
    label: {
      fontSize: '.8rem',
      fontWeight: 700,
      color: '#374151',
      letterSpacing: '.03em',
    },
    forgotLink: {
      fontSize: '.8rem',
      fontWeight: 600,
      color: '#2563eb',
      textDecoration: 'none',
    },
    inputWrap: { position: 'relative' as const },
    input: {
      width: '100%',
      height: 50,
      padding: '0 48px 0 16px',
      borderRadius: 12,
      border: '2px solid #e5e7eb',
      background: '#f9fafb',
      fontSize: '.9rem',
      color: '#111827',
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color .2s, background .2s, box-shadow .2s',
      boxSizing: 'border-box' as const,
    },
    eyeBtn: {
      position: 'absolute' as const,
      right: 14, top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0,
      transition: 'color .2s',
    },

    /* remember */
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '.6rem',
      margin: '1rem 0 .4rem',
    },
    checkbox: {
      width: 18, height: 18,
      accentColor: '#2563eb',
      cursor: 'pointer',
    },
    rememberLabel: {
      fontSize: '.85rem',
      fontWeight: 500,
      color: '#111827',
      cursor: 'pointer',
      userSelect: 'none' as const,
    },

    /* error */
    errorBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 10,
      padding: '.65rem 1rem',
      fontSize: '.83rem',
      color: '#dc2626',
      marginBottom: '.8rem',
    },

    /* submit */
    btnSubmit: {
      width: '100%',
      height: 52,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(37,99,235,.45)',
      transition: 'transform .15s, box-shadow .15s',
      marginTop: '.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
      letterSpacing: '.02em',
    },
    btnDisabled: { opacity: .6, cursor: 'not-allowed' as const },

    spinner: {
      width: 18, height: 18,
      border: '2.5px solid rgba(255,255,255,.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'cui-spin .7s linear infinite',
      flexShrink: 0,
    },

    /* divider */
    divider: { display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.4rem 0' },
    dividerLine: { flex: 1, height: 1, background: '#e5e7eb' },
    dividerText: { fontSize: '.82rem', color: '#9ca3af', fontWeight: 500 },

    /* register */
    registerRow: { textAlign: 'center' as const, fontSize: '.88rem', color: '#4b5563' },
    registerLink: { fontWeight: 700, color: '#dc2626', textDecoration: 'none' },

    /* ssl */
    sslBadge: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '.45rem', marginTop: '1.2rem',
    },
    sslDot: { width: 10, height: 10, background: '#22c55e', borderRadius: 3 },
    sslText: { fontSize: '.75rem', color: '#9ca3af', fontWeight: 500 },

    /* success overlay */
    successOverlay: {
      position: 'fixed' as const,
      inset: 0, zIndex: 100,
      background: 'linear-gradient(135deg, rgba(30,77,183,.97) 0%, rgba(26,58,110,.97) 100%)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center' as const,
      padding: '2rem',
      animation: 'cui-overlayIn .45s ease',
    },
    successLogo: {
      width: 220, maxWidth: '80%',
      marginBottom: '2rem',
      filter: 'drop-shadow(0 12px 32px rgba(0,0,0,.35))',
      animation: 'cui-bounceIn .75s .2s both',
    },
    successTitle: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '2.6rem', fontWeight: 800,
      color: '#fff',
      textShadow: '0 4px 16px rgba(0,0,0,.25)',
      marginBottom: '.75rem',
    },
    successSub: {
      fontSize: '1.1rem', color: 'rgba(255,255,255,.85)',
      marginBottom: '2rem',
    },
    dots: { display: 'flex', gap: '.65rem', justifyContent: 'center' },
  } as const;

  /* Feature list data */
  const features = ['Flota moderna y segura', 'Rutas a todo Nariño', 'Atención 24/7'];

  /* Input focus / blur style helpers (applied via ref-free inline handlers) */
  const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#2563eb';
    e.currentTarget.style.background  = '#fff';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(37,99,235,.12)';
    e.currentTarget.style.transform   = 'scale(1.01)';
  };
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e5e7eb';
    e.currentTarget.style.background  = '#f9fafb';
    e.currentTarget.style.boxShadow   = 'none';
    e.currentTarget.style.transform   = 'scale(1)';
  };

  return (
    <div style={S.page}>

      {/* ── Hero background ── */}
      <div style={S.heroBg}>
        <img src={heroImg} alt="Bus COOTRANAR en carretera de Nariño" style={S.heroImg} />
        <div style={S.heroOverlay} />
      </div>

      {/* ── Blue left accent bar ── */}
      <div style={S.accentBar} />

      {/* ── Content ── */}
      <div style={S.content} className="cootranar-content">

        {/* ── Back button (only visible on mobile when form is shown) ── */}
        {showForm && (
          <button
            style={S.backButton}
            className="cootranar-back-button"
            onClick={handleHideForm}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, .25)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, .15)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            aria-label="Volver"
          >
            ←
          </button>
        )}

        {/* ── Left branding panel ── */}
        <div style={S.branding} className={`cootranar-branding ${showForm ? 'hidden' : ''}`}>

          {/* Logo */}
          <div style={S.logoRow}>
            <div style={S.logoIcon}>
              <span style={S.logoLetter}>C</span>
            </div>
            <span style={S.logoName}>COOTRANAR</span>
          </div>

          {/* Tagline */}
          <p style={S.tagline}>Viaja con seguridad por Nariño</p>
          <p style={S.taglineSub}>
            Conectamos los paisajes más hermosos del sur de Colombia con la comodidad que mereces.
          </p>

          {/* Features */}
          <div style={S.features}>
            {features.map((f) => (
              <div key={f} style={S.featureItem}>
                <div style={S.featureDot}><CheckIcon /></div>
                <span style={S.featureText}>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            style={S.ctaButton}
            className="cootranar-cta-button"
            onClick={handleShowForm}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0, 0, 0, .3)';
              const arrow = e.currentTarget.querySelector('.arrow-icon') as HTMLElement;
              if (arrow) arrow.style.transform = 'translateY(3px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, .25)';
              const arrow = e.currentTarget.querySelector('.arrow-icon') as HTMLElement;
              if (arrow) arrow.style.transform = 'translateY(0)';
            }}
          >
            Comenzar
            <span className="arrow-icon" style={S.arrowIcon}>↓</span>
          </button>
        </div>

        {/* ── Right form panel ── */}
        <div 
          style={S.formPanel} 
          className={`cootranar-form-panel ${showForm ? 'show' : 'hidden'}`}
        >
          <div style={S.card} className="cootranar-card">

            {/* Header */}
            <h2 style={S.cardTitle}>Bienvenido de nuevo</h2>
            <p style={S.cardSub}>Ingresa tus credenciales para acceder a tu cuenta</p>

            {/* Error message */}
            {error && (
              <div
                key={shakeKey}
                ref={errorRef}
                style={{ ...S.errorBox, animation: 'cui-shake .4s ease' }}
              >
                <ErrorIcon />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div style={S.fieldWrap}>
                <label style={S.label} htmlFor="email">Correo Electrónico</label>
                <div style={{ ...S.inputWrap, marginTop: '.45rem' }}>
                  <input
                    style={S.input}
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={S.fieldWrap}>
                <div style={S.fieldHeader}>
                  <label style={S.label} htmlFor="password">Contraseña</label>
                  <a style={S.forgotLink} href="#">¿Olvidaste tu contraseña?</a>
                </div>
                <div style={S.inputWrap}>
                  <input
                    style={S.input}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                  />
                  <button
                    type="button"
                    style={S.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
              </div>



              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ ...S.btnSubmit, ...(loading ? S.btnDisabled : {}) }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(37,99,235,.55)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(37,99,235,.45)';
                }}
                onMouseDown={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(.98)';
                }}
                onMouseUp={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
              >
                {loading ? (
                  <>
                    <span style={S.spinner} />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={S.divider}>
              <div style={S.dividerLine} />

            </div>



            {/* SSL badge */}
            <div style={S.sslBadge}>
              <div style={S.sslDot} />
              <span style={S.sslText}>Conexión segura SSL</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Success overlay ── */}
      {loginSuccess && (
        <div style={S.successOverlay}>
          <img
            src={logoImg}
            alt="Logo COOTRANAR"
            style={S.successLogo}
          />
          <h2 style={S.successTitle}>¡Bienvenido!</h2>
          <p style={S.successSub}>Iniciando sesión...</p>
          <div style={S.dots}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 12, height: 12,
                  background: '#fff',
                  borderRadius: '50%',
                  animation: `cui-dot 1.4s ${i * 0.16}s infinite ease-in-out both`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};