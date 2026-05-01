/**
 * Badge Component - COOTRANAR Design System
 * 
 * Componente de badge para indicadores de estado
 * @see ../../../DESIGN.md
 */

import type { CSSProperties, ReactNode } from 'react';
import { components } from '../../../styles/design-tokens';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  style?: CSSProperties;
}

export const Badge = ({
  children,
  variant = 'info',
  className = '',
  style = {},
}: BadgeProps) => {
  // Seleccionar estilos según variante
  const baseStyles = (() => {
    switch (variant) {
      case 'success':
        return components.badgeSuccess;
      case 'warning':
        return components.badgeWarning;
      case 'danger':
        return components.badgeDanger;
      case 'info':
        return components.badgeInfo;
    }
  })();

  return (
    <span
      className={className}
      style={{
        ...baseStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
