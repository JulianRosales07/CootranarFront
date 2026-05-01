/**
 * Design Tokens - COOTRANAR Design System
 * 
 * Tokens extraídos de DESIGN.md para uso en TypeScript/React
 * Mantener sincronizado con DESIGN.md
 * 
 * @version alpha
 * @see ../../../DESIGN.md
 */

// ============================================================================
// COLORES
// ============================================================================

export const colors = {
  // Colores Corporativos Primarios
  primary: '#0D3B8E',
  primaryDark: '#0b2454',
  primaryHover: '#1e4ed8',
  primaryLight: '#e0e7ff',
  
  // Colores Secundarios
  secondary: '#c2844a',
  secondaryLight: '#fef3c7',
  
  // Colores de Estado
  success: '#22c55e',
  successLight: '#dcfce7',
  successDark: '#166534',
  
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#b45309',
  
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  dangerDark: '#b91c1c',
  
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#1e40af',
  
  // Colores Especiales
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  purpleDark: '#6d28d9',
  
  // Escala de Grises (Slate)
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Colores Funcionales
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Colores de Overlay
  overlay: 'rgba(15, 23, 42, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayMedium: 'rgba(255, 255, 255, 0.08)',
} as const;

// ============================================================================
// TIPOGRAFÍA
// ============================================================================

export const fontFamilies = {
  display: 'Montserrat, sans-serif',
  sans: 'Public Sans, system-ui, sans-serif',
} as const;

export const typography = {
  // Display
  displayXl: {
    fontFamily: fontFamilies.display,
    fontSize: '2.6rem',
    fontWeight: 900,
    lineHeight: 1.2,
    letterSpacing: '0.04em',
  },
  displayLg: {
    fontFamily: fontFamilies.display,
    fontSize: '2.1rem',
    fontWeight: 900,
    lineHeight: 1.2,
  },
  displayMd: {
    fontFamily: fontFamilies.display,
    fontSize: '1.65rem',
    fontWeight: 800,
    lineHeight: 1.3,
  },
  
  // Headings
  h1: {
    fontFamily: fontFamilies.display,
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h2: {
    fontFamily: fontFamilies.sans,
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  h3: {
    fontFamily: fontFamilies.sans,
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  h4: {
    fontFamily: fontFamilies.sans,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.5,
  },
  h5: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 1.5,
  },
  
  // Body
  bodyLg: {
    fontFamily: fontFamilies.sans,
    fontSize: '1.1rem',
    fontWeight: 400,
    lineHeight: 1.75,
  },
  bodyMd: {
    fontFamily: fontFamilies.sans,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySm: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodyXs: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Body Enfático
  bodyBold: {
    fontFamily: fontFamilies.sans,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.6,
  },
  bodySemibold: {
    fontFamily: fontFamilies.sans,
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6,
  },
  
  // Labels
  labelLg: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: '0.03em',
  },
  labelMd: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.8rem',
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: '0.03em',
  },
  labelSm: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  labelCaps: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
  },
  
  // Caption
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  
  // Botones
  buttonLg: {
    fontFamily: fontFamilies.display,
    fontSize: '1.15rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  buttonMd: {
    fontFamily: fontFamilies.display,
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  buttonSm: {
    fontFamily: fontFamilies.sans,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
} as const;

// ============================================================================
// BORDES REDONDEADOS
// ============================================================================

export const rounded = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  '4xl': '22px',
  full: '9999px',
} as const;

// ============================================================================
// ESPACIADO
// ============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
} as const;

// ============================================================================
// SOMBRAS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 20px rgba(37, 99, 235, 0.45)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.25)',
  xl: '0 24px 64px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// COMPONENTES
// ============================================================================

export const components = {
  // Botones
  buttonPrimary: {
    backgroundColor: colors.primary,
    color: colors.white,
    ...typography.buttonMd,
    borderRadius: rounded.xl,
    padding: '12px 24px',
    height: '52px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: shadows.md,
    transition: 'all 0.2s ease',
  },
  
  buttonSecondary: {
    backgroundColor: colors.gray100,
    color: colors.gray700,
    ...typography.buttonSm,
    borderRadius: rounded.md,
    padding: '10px 16px',
    border: `1px solid ${colors.gray200}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  buttonDanger: {
    backgroundColor: colors.danger,
    color: colors.white,
    ...typography.buttonMd,
    borderRadius: rounded.md,
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Inputs
  inputDefault: {
    backgroundColor: colors.gray50,
    color: colors.gray800,
    ...typography.bodyMd,
    borderRadius: rounded.xl,
    padding: '0 48px 0 16px',
    height: '50px',
    border: `2px solid ${colors.gray200}`,
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  
  // Cards
  cardDefault: {
    backgroundColor: colors.white,
    borderRadius: rounded['2xl'],
    padding: spacing['2xl'],
    border: `1px solid ${colors.gray200}`,
    boxShadow: shadows.sm,
  },
  
  cardElevated: {
    backgroundColor: colors.white,
    borderRadius: rounded['4xl'],
    padding: spacing['4xl'],
    boxShadow: shadows.xl,
  },
  
  // Badges
  badgeSuccess: {
    backgroundColor: colors.successLight,
    color: colors.successDark,
    ...typography.labelSm,
    borderRadius: rounded.full,
    padding: '2px 8px',
    border: `1px solid ${colors.success}`,
    display: 'inline-block',
  },
  
  badgeWarning: {
    backgroundColor: colors.warningLight,
    color: colors.warningDark,
    ...typography.labelSm,
    borderRadius: rounded.full,
    padding: '2px 8px',
    border: `1px solid ${colors.warning}`,
    display: 'inline-block',
  },
  
  badgeDanger: {
    backgroundColor: colors.dangerLight,
    color: colors.dangerDark,
    ...typography.labelSm,
    borderRadius: rounded.full,
    padding: '2px 8px',
    border: `1px solid ${colors.danger}`,
    display: 'inline-block',
  },
  
  badgeInfo: {
    backgroundColor: colors.infoLight,
    color: colors.infoDark,
    ...typography.labelSm,
    borderRadius: rounded.full,
    padding: '2px 8px',
    display: 'inline-block',
  },
} as const;

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Genera estilos de hover para botones
 */
export const getButtonHoverStyles = (type: 'primary' | 'secondary' | 'danger') => {
  const baseStyles = {
    transform: 'translateY(-1px)',
    transition: 'all 0.2s ease',
  };
  
  switch (type) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: colors.primaryHover,
        boxShadow: '0 8px 28px rgba(37, 99, 235, 0.55)',
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: colors.white,
        boxShadow: shadows.sm,
      };
    case 'danger':
      return {
        ...baseStyles,
        backgroundColor: colors.dangerDark,
      };
  }
};

/**
 * Genera estilos de focus para inputs
 */
export const getInputFocusStyles = () => ({
  backgroundColor: colors.white,
  borderColor: colors.primary,
  boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
  transform: 'scale(1.01)',
});

/**
 * Genera estilos para iconos contenedores
 */
export const getIconContainerStyles = (variant: 'primary' | 'success' | 'warning' | 'danger') => {
  const baseStyles = {
    width: '40px',
    height: '40px',
    borderRadius: rounded.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  switch (variant) {
    case 'primary':
      return { ...baseStyles, backgroundColor: colors.primaryLight, color: colors.primary };
    case 'success':
      return { ...baseStyles, backgroundColor: colors.successLight, color: colors.success };
    case 'warning':
      return { ...baseStyles, backgroundColor: colors.warningLight, color: colors.warning };
    case 'danger':
      return { ...baseStyles, backgroundColor: colors.dangerLight, color: colors.danger };
  }
};

// ============================================================================
// TIPOS
// ============================================================================

export type Color = keyof typeof colors;
export type Typography = keyof typeof typography;
export type Rounded = keyof typeof rounded;
export type Spacing = keyof typeof spacing;
export type Shadow = keyof typeof shadows;
export type Component = keyof typeof components;
