/**
 * Button Component - COOTRANAR Design System
 * 
 * Componente de botón que implementa los tokens del sistema de diseño
 * @see ../../../DESIGN.md
 */

import type { CSSProperties, ReactNode } from 'react';
import { components, getButtonHoverStyles } from '../../../styles/design-tokens';

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  style = {},
}: ButtonProps) => {
  // Seleccionar estilos base según variante
  const baseStyles = (() => {
    switch (variant) {
      case 'primary':
        return components.buttonPrimary;
      case 'secondary':
        return components.buttonSecondary;
      case 'danger':
        return components.buttonDanger;
    }
  })();

  // Estilos combinados
  const buttonStyles: CSSProperties = {
    ...baseStyles,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style,
  };

  // Handlers de hover
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const hoverStyles = getButtonHoverStyles(variant);
    Object.assign(e.currentTarget.style, hoverStyles);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    Object.assign(e.currentTarget.style, {
      backgroundColor: baseStyles.backgroundColor,
      transform: 'translateY(0)',
      boxShadow: baseStyles.boxShadow,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={buttonStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {loading && (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '18px',
            animation: 'spin 1s linear infinite',
          }}
        >
          autorenew
        </span>
      )}
      {!loading && icon && icon}
      {children}
    </button>
  );
};

// Estilos de animación para el spinner
if (typeof document !== 'undefined') {
  const styleId = 'button-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}
