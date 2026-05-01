/**
 * Input Component - COOTRANAR Design System
 * 
 * Componente de input que implementa los tokens del sistema de diseño
 * @see ../../../DESIGN.md
 */

import type { CSSProperties, InputHTMLAttributes } from 'react';
import { components, getInputFocusStyles } from '../../../styles/design-tokens';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: CSSProperties;
}

export const Input = ({
  label,
  error,
  helperText,
  fullWidth = false,
  icon,
  style = {},
  id,
  ...inputProps
}: InputProps) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const focusStyles = getInputFocusStyles();
    Object.assign(e.currentTarget.style, focusStyles);
    inputProps.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.currentTarget.style, {
      backgroundColor: components.inputDefault.backgroundColor,
      borderColor: components.inputDefault.border?.split(' ')[2] || '#e2e8f0',
      boxShadow: 'none',
      transform: 'scale(1)',
    });
    inputProps.onBlur?.(e);
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#374151',
            letterSpacing: '0.03em',
            marginBottom: '8px',
          }}
        >
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          {...inputProps}
          style={{
            ...components.inputDefault,
            width: fullWidth ? '100%' : 'auto',
            borderColor: error ? '#dc2626' : components.inputDefault.border?.split(' ')[2],
            ...style,
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {icon && (
          <div
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p
          style={{
            fontSize: '0.75rem',
            color: '#dc2626',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            error
          </span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          style={{
            fontSize: '0.75rem',
            color: '#64748b',
            marginTop: '4px',
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
